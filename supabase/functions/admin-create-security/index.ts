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
  const { error: profileError } = await context.supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, user_id: userId, ...profileData }, { onConflict: "user_id" });
  if (profileError) {
    await context.supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }
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
      role: "security_officer",
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
    const finalPassword = password || generateTemporaryPassword(12);

    const { user: createdUser, password: tempPassword } = await createAuthUser(
      { email, password: finalPassword, full_name },
      false, // Direct creation for staff
      context,
      req
    );

    console.log("Auth user created:", createdUser.id);

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
    await updateUserProfile(createdUser.id, profileData, context);
    console.log("Security officer profile updated successfully");

    // Assign security officer role
    await assignUserRole(createdUser.id, "security_officer", context);
    console.log("Security officer role assigned successfully");

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
      console.log(`Email sent successfully for security officer: ${email}`);
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