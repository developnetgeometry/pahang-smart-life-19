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
    .eq("id", currentUser.id)
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

async function checkModuleEnabled(moduleName: string, context: AdminContext): Promise<boolean> {
  if (context.isStateAdmin) return true;
  if (!context.adminProfile?.community_id) return false;

  const { data, error } = await context.supabase
    .from("community_features")
    .select("is_enabled")
    .eq("community_id", context.adminProfile.community_id)
    .eq("module_name", moduleName)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking module:", error);
    return false;
  }
  return data?.is_enabled || false;
}

async function createAuthUser(
  userData: { email: string; password?: string; full_name: string },
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
        data: { full_name: userData.full_name },
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
    .upsert({ id: userId, ...profileData });
  if (profileError) {
    await context.supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }
}

async function assignUserRole(userId: string, role: string, context: AdminContext) {
  const { error: roleUpsertError } = await context.supabaseAdmin
    .from("enhanced_user_roles")
    .upsert({
      user_id: userId,
      role,
      assigned_by: context.currentUser.id,
      district_id: context.adminProfile?.district_id || null,
      is_active: true,
      assigned_at: new Date().toISOString(),
    });

  if (roleUpsertError) {
    await context.supabaseAdmin.auth.admin.deleteUser(userId);
    await context.supabaseAdmin.from("profiles").delete().eq("id", userId);
    throw new Error(`Failed to assign role: ${roleUpsertError.message}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const context = await initializeAdminContext(req);

    // Check if security module is enabled
    const securityEnabled = await checkModuleEnabled("security", context);
    if (!securityEnabled) {
      throw new Error(
        "Security module is disabled. Cannot create Security Officer accounts."
      );
    }

    const {
      email,
      password,
      full_name,
      phone,
      security_license_number,
      badge_id,
      shift_type,
    } = await req.json();

    console.log("Creating security officer with data:", {
      email,
      full_name,
      badge_id,
      admin_community: context.adminProfile?.community_id,
    });

    // Create auth user with direct creation
    const safePassword = typeof password === 'string' && password.length >= 8 ? password : 'TempPassword123!';

    const authUser = await createAuthUser(
      { email, password: safePassword, full_name },
      false, // Direct creation for staff
      context,
      req
    );

    console.log("Auth user created:", authUser.user.id);

    // Prepare security officer profile data
    const profileData: any = {
      full_name,
      phone: phone || null,
      email,
      district_id: context.adminProfile?.district_id || null,
      community_id: context.adminProfile?.community_id || null,
      account_status: "approved", // Staff are auto-approved
    };

    // Add security-specific fields
    if (security_license_number) profileData.security_license_number = security_license_number;
    if (badge_id) profileData.badge_id = badge_id;
    if (shift_type) profileData.shift_type = shift_type;

    // Update profile with security officer data
    await updateUserProfile(authUser.user.id, profileData, context);
    console.log("Security officer profile updated successfully");

    // Assign security officer role
    await assignUserRole(authUser.user.id, "security_officer", context);
    console.log("Security officer role assigned successfully");

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          full_name,
          role: "security_officer",
          badge_id,
          shift_type,
        },
        credentials_created: true,
        message: "Security officer account created successfully.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Create security officer error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create security officer account",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});