import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type AdminContext = {
  currentUser: any;
  adminProfile: { community_id: string | null; district_id: string | null };
  isStateAdmin: boolean;
  supabaseAdmin: any;
  supabase: any;
};

async function initializeAdminContext(req: Request): Promise<AdminContext> {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? "",
        },
      },
    }
  );

  const {
    data: { user: currentUser },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !currentUser) {
    throw new Error("Authentication required. Please log in again.");
  }

  const { data: userRoles, error: roleError } = await supabase
    .from("enhanced_user_roles")
    .select("role")
    .eq("user_id", currentUser.id)
    .eq("is_active", true);
  if (roleError) {
    throw new Error("Error checking user roles");
  }

  const hasAdminRole = userRoles?.some((r) =>
    ["community_admin", "district_coordinator", "state_admin"].includes(r.role)
  );
  if (!hasAdminRole) {
    throw new Error("Insufficient permissions. Admin role required.");
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("profiles")
    .select("community_id, district_id")
    .eq("user_id", currentUser.id)
    .single();

  const isStateAdmin = userRoles?.some((r) => r.role === "state_admin");
  if (adminProfileError || (!adminProfile?.community_id && !isStateAdmin)) {
    if (!isStateAdmin) {
      throw new Error("Admin must be assigned to a community");
    }
  }

  return {
    currentUser,
    adminProfile: adminProfile || { community_id: null, district_id: null },
    isStateAdmin,
    supabaseAdmin,
    supabase,
  };
}

async function createAuthUser(
  userData: { email: string; password?: string; full_name: string; district_id?: string; community_id?: string; signup_flow?: string },
  useInviteFlow: boolean,
  context: AdminContext,
  req: Request
) {
  let authUser: any;
  let authError: any;

  if (useInviteFlow) {
    const frontendUrl =
      Deno.env.get("FRONTEND_URL") || req.headers.get("origin") || "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/complete-account`;

    const inviteResult = await context.supabaseAdmin.auth.admin.inviteUserByEmail(
      userData.email,
      {
        redirectTo: redirectUrl,
        data: { 
          full_name: userData.full_name,
          signup_flow: userData.signup_flow || 'resident_invite',
          district_id: userData.district_id,
          community_id: userData.community_id
        },
      }
    );

    authUser = inviteResult.data;
    authError = inviteResult.error;
  } else {
    const createResult = await context.supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: { full_name: userData.full_name },
    });

    authUser = createResult.data;
    authError = createResult.error;
  }

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`);
  }
  if (!authUser?.user) {
    throw new Error("Failed to create user: No user returned");
  }
  return authUser;
}

async function updateUserProfile(
  userId: string,
  profileData: any,
  context: AdminContext
) {
  const { error: profileError } = await context.supabaseAdmin
    .from("profiles")
    .upsert({ user_id: userId, ...profileData }, { onConflict: "user_id" });
  if (profileError) {
    await context.supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }
}

async function assignUserRole(userId: string, role: string, context: AdminContext) {
  // Check if user already has this role (handle_new_user trigger may have assigned it)
  const { data: existingRole } = await context.supabaseAdmin
    .from("enhanced_user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", role)
    .single();

  if (existingRole) {
    console.log(`User ${userId} already has role ${role}, skipping assignment`);
    return;
  }

  const { error: roleUpsertError } = await context.supabaseAdmin
    .from("enhanced_user_roles")
    .upsert({
      user_id: userId,
      role,
      assigned_by: context.currentUser.id,
      district_id: context.adminProfile?.district_id || null,
      is_active: true,
      assigned_at: new Date().toISOString(),
    }, { 
      onConflict: "user_id,role,district_id"
    });

  if (roleUpsertError) {
    console.error("Role assignment error:", roleUpsertError);
    await context.supabaseAdmin.auth.admin.deleteUser(userId);
    await context.supabaseAdmin.from("profiles").delete().eq("user_id", userId);
    throw new Error(`Failed to assign role: ${roleUpsertError.message}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const context = await initializeAdminContext(req);

    const {
      email,
      full_name,
      phone,
      unit_number,
      family_size,
      emergency_contact_name,
      emergency_contact_phone,
    } = await req.json();

    // Basic validation
    if (!email || !full_name) {
      return new Response(
        JSON.stringify({
          error: "Email and full name are required fields.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (!unit_number) {
      return new Response(
        JSON.stringify({
          error: "Unit number is required for resident accounts.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Creating resident with data:", {
      email,
      full_name,
      unit_number,
      admin_community: context.adminProfile?.community_id,
    });

    // Create auth user using invite flow with enhanced metadata
    const authUser = await createAuthUser(
      { 
        email, 
        full_name,
        district_id: context.adminProfile?.district_id,
        community_id: context.adminProfile?.community_id,
        signup_flow: 'resident_invite'
      },
      true, // Use invite flow for residents
      context,
      req
    );

    console.log("Auth user invited:", authUser.user.id);

    // Prepare resident profile data
    const profileData: any = {
      full_name,
      phone: phone || null,
      email,
      district_id: context.adminProfile?.district_id || null,
      community_id: context.adminProfile?.community_id || null,
      account_status: "pending", // Residents need approval
    };

    // Add resident-specific fields
    if (unit_number) profileData.unit_number = unit_number;
    if (family_size) profileData.family_size = parseInt(family_size);
    if (emergency_contact_name) profileData.emergency_contact_name = emergency_contact_name;
    if (emergency_contact_phone) profileData.emergency_contact_phone = emergency_contact_phone;

    // Update profile with resident data
    await updateUserProfile(authUser.user.id, profileData, context);
    console.log("Resident profile updated successfully");

    // Assign resident role
    await assignUserRole(authUser.user.id, "resident", context);
    console.log("Resident role assigned successfully");

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          full_name,
          role: "resident",
          unit_number,
        },
        invitation_sent: true,
        message: "Resident invitation sent successfully. They will receive an email to complete their account setup.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Create resident error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create resident account",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});