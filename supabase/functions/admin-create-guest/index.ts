const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminContext {
  currentUser: any;
  adminProfile: any;
  isStateAdmin: boolean;
  supabaseAdmin: any;
  supabase: any;
}

async function initializeAdminContext(req: Request): Promise<AdminContext> {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid authentication token');
  }

  const { data: userRoles, error: rolesError } = await supabaseAdmin
    .from('enhanced_user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (rolesError) {
    throw new Error(`Failed to fetch user roles: ${rolesError.message}`);
  }

  const roles = userRoles.map((r: any) => r.role);
  const allowedRoles = ['community_admin', 'district_coordinator', 'state_admin'];
  
  if (!roles.some((role: string) => allowedRoles.includes(role))) {
    throw new Error('Insufficient permissions to create guest users');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError) {
    throw new Error(`Failed to fetch admin profile: ${profileError.message}`);
  }

  const isStateAdmin = roles.includes('state_admin');
  
  return {
    currentUser: user,
    adminProfile: profile,
    isStateAdmin,
    supabaseAdmin,
    supabase,
  };
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
    console.log(`Attempting to create user directly: ${userData.email}`);
    
    const createResult = await context.supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: { full_name: userData.full_name },
    });

    authUser = createResult.data;
    authError = createResult.error;
  }

  // Handle existing email error gracefully for guest users
  if (authError && authError.message?.includes("already been registered")) {
    console.log(`User with email ${userData.email} already exists, attempting to reuse account`);
    
    // Look up existing user by email
    const { data: users, error: getUserError } = await context.supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      throw new Error(`Failed to lookup existing user: ${getUserError.message}`);
    }
    
    const existingUser = users.users.find((u: any) => u.email === userData.email);
    
    if (!existingUser) {
      throw new Error(`User exists but could not be found: ${userData.email}`);
    }
    
    console.log(`Found existing user: ${existingUser.id}`);
    authUser = { user: existingUser };
    authError = null;
  } else if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`);
  }

  if (!authUser?.user) {
    throw new Error("Failed to create or retrieve user");
  }

  console.log(`Auth user ${useInviteFlow ? 'invited' : 'created'}: ${authUser.user.id}`);
  return authUser.user.id;
}

async function updateUserProfile(userId: string, profileData: any, context: AdminContext) {
  console.log("Updating guest profile for user:", userId);
  
  // Check if profile already exists
  const { data: existingProfile } = await context.supabaseAdmin
    .from("profiles")
    .select("id, account_status")
    .eq("user_id", userId)
    .single();
  
  let profileUpdate = {
    user_id: userId,
    full_name: profileData.full_name,
    district_id: profileData.district_id,
    community_id: profileData.community_id,
    account_status: profileData.account_status,
    access_expires_at: profileData.access_expires_at,
    updated_at: new Date().toISOString(),
  };
  
  // If profile exists and has account_status, preserve it unless we're explicitly setting it
  if (existingProfile && existingProfile.account_status && !profileData.account_status) {
    profileUpdate.account_status = existingProfile.account_status;
  }

  const { error: profileError } = await context.supabaseAdmin
    .from("profiles")
    .upsert(profileUpdate, { onConflict: "user_id" });

  if (profileError) {
    console.error("Profile update error:", profileError);
    await context.supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }
  
  console.log("Guest profile updated successfully");
}

async function assignUserRole(userId: string, role: string, context: AdminContext) {
  console.log(`Assigning ${role} role to user: ${userId}`);
  
  const { error: roleUpsertError } = await context.supabaseAdmin
    .from("enhanced_user_roles")
    .upsert({
      user_id: userId,
      role,
      assigned_by: context.currentUser.id,
      district_id: context.adminProfile?.district_id || null,
      is_active: true,
      assigned_at: new Date().toISOString(),
    }, { onConflict: "user_id,role,district_id" });

  if (roleUpsertError) {
    await context.supabaseAdmin.auth.admin.deleteUser(userId);
    await context.supabaseAdmin.from("profiles").delete().eq("user_id", userId);
    throw new Error(`Failed to assign role: ${roleUpsertError.message}`);
  }
  
  console.log("Guest role assigned successfully");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const context = await initializeAdminContext(req);

    const { email, password, full_name, phone, access_expires_at } = await req.json();
    
    console.log("Raw request data:", { email, password, full_name, phone, access_expires_at });

    if (!email || !full_name || !access_expires_at) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, full_name, access_expires_at" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate expiration date
    const expirationDate = new Date(access_expires_at);
    if (expirationDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: "Access expiration date must be in the future" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const validatedData = {
      email,
      full_name,
      access_expires_at,
      expiration_date_parsed: expirationDate,
      admin_community: context.adminProfile?.community_id,
      admin_district: context.adminProfile?.district_id,
      is_state_admin: context.isStateAdmin,
    };

    console.log("Creating guest with validated data:", validatedData);

    // Create auth user directly (no invite flow for guests)
    const userId = await createAuthUser(
      { email, password, full_name },
      false, // Use direct creation for guests
      context,
      req
    );

    // Update profile with guest-specific data
    await updateUserProfile(userId, {
      full_name,
      district_id: context.adminProfile?.district_id,
      community_id: context.adminProfile?.community_id,
      account_status: "approved", // Guests are auto-approved
      access_expires_at: expirationDate.toISOString(),
    }, context);

    // Assign guest role
    await assignUserRole(userId, "guest", context);

    console.log("Guest creation completed successfully:", {
      userId: userId,
      email: email,
      role: "guest"
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: email,
          full_name,
          role: "guest",
          access_expires_at,
        },
        credentials_created: true,
        message: "Guest account created successfully with temporary access.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Create guest error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Enhanced error response with more details
    const errorMessage = error.message || "Failed to create guest account";
    const errorResponse = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});