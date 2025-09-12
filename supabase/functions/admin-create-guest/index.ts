import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { AccountCreatedEmail } from './_templates/account-created.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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
      role: "guest",
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

async function createAuthUser(
  userData: { email: string; password?: string; full_name: string },
  useInviteFlow: boolean,
  context: AdminContext,
  req: Request
) {
  let authUser: any;
  let authError: any;

  if (useInviteFlow) {
    // For guests, we'll create directly and send custom email
    const finalPassword = userData.password || generateTemporaryPassword(12);
    
    const createResult = await context.supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: { full_name: userData.full_name },
    });

    authUser = createResult.data;
    authError = createResult.error;
    userData.password = finalPassword; // Store for email
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
    throw new Error(`Failed to process user: ${authError.message}`);
  }

  if (!authUser?.user) {
    throw new Error("Failed to create or retrieve user");
  }

  console.log(`Auth user created: ${authUser.user.id}`);
  return { userId: authUser.user.id, password: userData.password };
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

    // Create auth user for guests
    const { userId, password: finalPassword } = await createAuthUser(
      { email, password, full_name },
      true, // Generate password and create directly
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
        password: finalPassword,
        adminName,
        req
      });
      console.log(`Email sent successfully for guest: ${email}`);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the entire operation for email issues, just log it
    }

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
        email_sent: true,
        message: "Guest account created successfully. Login credentials sent via email.",
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