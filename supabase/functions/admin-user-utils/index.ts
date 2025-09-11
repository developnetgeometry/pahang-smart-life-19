import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export interface AdminContext {
  currentUser: any;
  adminProfile: { community_id: string | null; district_id: string | null };
  isStateAdmin: boolean;
  supabaseAdmin: any;
  supabase: any;
}

export async function initializeAdminContext(req: Request): Promise<AdminContext> {
  // Create admin client with service role key
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Create regular client to check caller permissions
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

  // Get current user and verify permissions
  const {
    data: { user: currentUser },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError || !currentUser) {
    throw new Error("Authentication required. Please log in again.");
  }

  // Check if user has admin role
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

  // Get admin's community and district context
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

export async function checkModuleEnabled(
  moduleName: string,
  context: AdminContext
): Promise<boolean> {
  // State admins bypass module checks
  if (context.isStateAdmin) {
    return true;
  }

  if (!context.adminProfile?.community_id) {
    return false;
  }

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

export async function createAuthUser(
  userData: {
    email: string;
    password?: string;
    full_name: string;
  },
  useInviteFlow: boolean,
  context: AdminContext,
  req: Request
) {
  let authUser;
  let authError;

  if (useInviteFlow) {
    const frontendUrl =
      Deno.env.get("FRONTEND_URL") ||
      req.headers.get("origin") ||
      "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/complete-account`;

    const inviteResult = await context.supabaseAdmin.auth.admin.inviteUserByEmail(
      userData.email,
      {
        redirectTo: redirectUrl,
        data: {
          full_name: userData.full_name,
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
      user_metadata: {
        full_name: userData.full_name,
      },
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

export async function updateUserProfile(
  userId: string,
  profileData: any,
  context: AdminContext
) {
  const { error: profileError } = await context.supabaseAdmin
    .from("profiles")
    .update(profileData)
    .eq("user_id", userId);

  if (profileError) {
    // Clean up auth user if profile update fails
    await context.supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }
}

export async function assignUserRole(
  userId: string,
  role: string,
  context: AdminContext
) {
  const { error: roleUpsertError } = await context.supabaseAdmin
    .from("enhanced_user_roles")
    .insert({
      user_id: userId,
      role: role,
      assigned_by: context.currentUser.id,
      district_id: context.adminProfile?.district_id || null,
      is_active: true,
      assigned_at: new Date().toISOString(),
    })
    .onConflict("user_id,role")
    .select();

  if (roleUpsertError) {
    // Clean up user and profile if role assignment fails
    await context.supabaseAdmin.auth.admin.deleteUser(userId);
    await context.supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);
    throw new Error(`Failed to assign role: ${roleUpsertError.message}`);
  }
}