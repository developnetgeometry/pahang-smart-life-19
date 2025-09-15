import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { AccountCreatedEmail } from './_templates/account-created.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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
  userData: { email: string; password?: string; full_name: string },
  useInviteFlow: boolean,
  context: AdminContext,
  req: Request
) {
  // Always use direct creation - no more invite flow to avoid Supabase default emails
  const finalPassword = userData.password || generateTemporaryPassword(12);
  
  const createResult = await context.supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: finalPassword,
    email_confirm: true, // Skip email confirmation since we send custom emails
    user_metadata: { full_name: userData.full_name },
  });

  if (createResult.error) {
    throw new Error(`Failed to create user: ${createResult.error.message}`);
  }
  if (!createResult.data?.user) {
    throw new Error("Failed to create user: No user returned");
  }
  
  return { user: createResult.data.user, password: finalPassword };
}

async function updateUserProfile(
  userId: string,
  profileData: any,
  context: AdminContext
) {
  console.log('Updating profile for user:', userId, 'with data:', profileData);
  
  // Use upsert to handle cases where profile doesn't exist yet
  const { error: profileError } = await context.supabaseAdmin
    .from("profiles")
    .upsert({
      id: userId,
      user_id: userId,
      ...profileData
    }, {
      onConflict: 'user_id'
    });
    
  if (profileError) {
    console.error("Profile upsert error:", profileError);
    // Clean up auth user if profile creation fails
    try {
      await context.supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (cleanupError) {
      console.error("Failed to cleanup auth user:", cleanupError);
    }
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }
  
  console.log('Profile updated successfully for user:', userId);
}

// Helper function to generate secure temporary password
function generateTemporaryPassword(length: number = 12): string {
  const charset = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Helper function to send user emails
async function sendUserEmail({
  email,
  full_name,
  password,
  adminName,
  req
}: {
  email: string;
  full_name: string;
  password: string;
  adminName: string;
  req: Request;
}) {
  const frontendUrl =
    Deno.env.get("FRONTEND_URL") ||
    req.headers.get("origin") ||
    "https://www.primapahang.com";

  const loginUrl = `${frontendUrl}/login`;
  
  const emailHtml = await renderAsync(
    React.createElement(AccountCreatedEmail, {
      full_name,
      email,
      role: "admin",
      temporary_password: password,
      login_url: loginUrl,
      admin_name: adminName,
    })
  );

  await resend.emails.send({
    from: 'Prima Pahang <noreply@primapahang.com>',
    to: [email],
    subject: 'Akaun Baharu Prima Pahang / New Prima Pahang Account',
    html: emailHtml,
  });
}

async function assignUserRole(userId: string, role: string, context: AdminContext) {
  console.log('Assigning role:', role, 'to user:', userId);

  await context.supabaseAdmin
    .from("enhanced_user_roles")
    .delete()
    .eq('user_id', userId)
    .eq('role', 'resident');
  
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
    console.error("Role assignment error:", roleUpsertError);
    // Clean up both auth user and profile if role assignment fails
    try {
      await context.supabaseAdmin.auth.admin.deleteUser(userId);
      await context.supabaseAdmin.from("profiles").delete().eq("user_id", userId);
    } catch (cleanupError) {
      console.error("Failed to cleanup user and profile:", cleanupError);
    }
    throw new Error(`Failed to assign role: ${roleUpsertError.message}`);
  }
  
  console.log('Role assigned successfully for user:', userId);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const context = await initializeAdminContext(req);

    const {
      email,
      password,
      full_name,
      phone,
      role, // community_admin, district_coordinator, state_admin
      district_id, // for specific assignments
      community_id, // for specific assignments
    } = await req.json();

    // Validate required fields
    if (!email || !full_name || !role) {
      throw new Error("Missing required fields: email, full_name, and role are required");
    }

    // Check if user already exists
    const { data: existingUser } = await context.supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();
    
    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Validate role
    const validAdminRoles = ["community_admin", "district_coordinator", "state_admin"];
    if (!validAdminRoles.includes(role)) {
      throw new Error(`Invalid admin role. Must be one of: ${validAdminRoles.join(", ")}`);
    }

    // Permission check: only state_admin can create other state_admin accounts
    if (role === "state_admin" && !context.isStateAdmin) {
      throw new Error("Only State Admins can create State Admin accounts");
    }

    // District coordinators can only create community admins
    const { data: userRoles } = await context.supabase
      .from("enhanced_user_roles")
      .select("role")
      .eq("user_id", context.currentUser.id)
      .eq("is_active", true);
    
    const isDistrictCoordinator = userRoles?.some(r => r.role === "district_coordinator");
    
    if (isDistrictCoordinator && role !== "community_admin") {
      throw new Error("District Coordinators can only create Community Admin accounts");
    }

    console.log(`Creating ${role} with data:`, {
      email,
      full_name,
      target_district: district_id,
      target_community: community_id,
    });

    // Create auth user with direct creation
    const finalPassword = password || generateTemporaryPassword(12);
    const { user: createdUser, password: tempPassword } = await createAuthUser(
      { email, password: finalPassword, full_name },
      false, // Direct creation for admin staff
      context,
      req
    );

    console.log("Auth user created:", createdUser.id);

    // Prepare admin profile data
    const profileData: any = {
      full_name,
      phone: phone || null,
      email,
      account_status: 'approved', // Auto-approve all admin accounts for immediate login
    };

    // Set district/community based on role and assignments
    if (role === "state_admin") {
      // State admins don't need specific district/community assignments
      profileData.district_id = null;
      profileData.community_id = null;
    } else if (role === "district_coordinator") {
      // Use provided district_id or admin's district
      profileData.district_id = district_id || context.adminProfile?.district_id;
      profileData.community_id = null; // District coordinators oversee multiple communities
    } else if (role === "community_admin") {
      // Use provided assignments or admin's assignments
      profileData.district_id = district_id || context.adminProfile?.district_id;
      profileData.community_id = community_id || context.adminProfile?.community_id;
    }

    // Update profile with admin data
    await updateUserProfile(createdUser.id, profileData, context);
    console.log(`${role} profile updated successfully`);

    // Assign admin role
    await assignUserRole(createdUser.id, role, context);
    console.log(`${role} role assigned successfully`);

    // Get admin's name for personalized emails
    const { data: adminProfile2, error: adminProfileError2 } = await context.supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", context.currentUser.id)
      .single();
    
    const adminName = adminProfile2?.full_name || "Administrator";

    // Send email with credentials
    try {
      await sendUserEmail({
        email,
        full_name,
        password: tempPassword,
        adminName,
        req
      });
      console.log(`Email sent successfully for ${role}: ${email}`);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the entire operation for email issues, just log it
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          full_name,
          role,
          district_id: profileData.district_id,
          community_id: profileData.community_id,
        },
        credentials_created: true,
        message: `${role.replace('_', ' ')} account created and approved successfully. Admin can login immediately.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Create admin error:`, error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create admin account",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});