import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { UserInvitationEmail } from './_templates/user-invitation.tsx';
import { AccountCreatedEmail } from './_templates/account-created.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper function to generate secure temporary password
function generateTemporaryPassword(length: number = 12): string {
  return 'password123'; // Use static password as requested
}

// Helper function to send user emails
async function sendUserEmail({
  role,
  email,
  full_name,
  password,
  adminName,
  req,
}: {
  role: string;
  email: string;
  full_name: string;
  password?: string;
  adminName: string;
  req: Request;
}) {
  const frontendUrl =
    Deno.env.get("FRONTEND_URL") ||
    req.headers.get("origin") ||
    "https://www.primapahang.com";

  if (role === "resident") {
    // For residents, send invitation email with temporary password
    const loginUrl = `${frontendUrl}/login`;
    
    const emailHtml = await renderAsync(
      React.createElement(UserInvitationEmail, {
        full_name,
        email,
        role,
        invitation_url: loginUrl,
        admin_name: adminName,
        temporary_password: password, // Include temporary password in resident emails
      })
    );

    await resend.emails.send({
      from: 'Prima Pahang <noreply@primapahang.com>',
      to: [email],
      subject: 'Jemputan Menyertai Prima Pahang / Invitation to Join Prima Pahang',
      html: emailHtml,
    });
  } else {
    // For staff and guests, send account created email with credentials
    const loginUrl = `${frontendUrl}/login`;
    
    const emailHtml = await renderAsync(
      React.createElement(AccountCreatedEmail, {
        full_name,
        email,
        role,
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({
          error: "Authentication required. Please log in again.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
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
      ["community_admin", "district_coordinator", "state_admin"].includes(
        r.role
      )
    );

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({
          error: "Insufficient permissions. Admin role required.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // Get admin's community and district context (relaxed for state_admin)
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

    // Check if required modules are enabled for role creation
    const checkModuleEnabled = async (moduleName: string) => {
      // State admins bypass module checks
      if (isStateAdmin) {
        return true;
      }

      if (!adminProfile?.community_id) {
        return false;
      }

      const { data, error } = await supabase
        .from("community_features")
        .select("is_enabled")
        .eq("community_id", adminProfile.community_id)
        .eq("module_name", moduleName)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = not found
        console.error("Error checking module:", error);
        return false;
      }

      return data?.is_enabled || false;
    };

    const {
      email,
      password,
      full_name,
      phone,
      role,
      // Auto-assign district/community from admin (form doesn't send these)
      // Role-specific fields
      unit_number, // for residents
      access_expires_at, // for guests
      family_size,
      emergency_contact_name,
      emergency_contact_phone,
      security_license_number,
      badge_id,
      shift_type,
      specialization,
      certifications,
      years_experience,
    } = await req.json();

    console.log("Creating user with data:", {
      email,
      full_name,
      role,
      admin_district: adminProfile?.district_id,
      admin_community: adminProfile?.community_id,
    });

    // Validate role against enabled modules
    if (role === "security_officer") {
      const securityEnabled = await checkModuleEnabled("security");
      if (!securityEnabled) {
        throw new Error(
          "Security module is disabled. Cannot create Security Officer accounts."
        );
      }
    }

    if (role === "facility_manager" || role === "maintenance_staff") {
      const facilitiesEnabled = await checkModuleEnabled("facilities");
      if (!facilitiesEnabled) {
        throw new Error(
          "Facilities module is disabled. Cannot create Facility Manager or Maintenance Staff accounts."
        );
      }
    }

    let authUser;
    let authError;
    let tempPassword; // Declare tempPassword variable

    // For residents, create user with temporary password (no auto email)
    if (role === "resident") {
      // Generate secure temporary password for residents
      tempPassword = generateTemporaryPassword(12);
      
      const createResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Skip email confirmation for invitation flow
        user_metadata: {
          full_name,
          invitation_pending: true, // Mark as invitation pending
        },
      });

      authUser = createResult.data;
      authError = createResult.error;
      
      if (authError) {
        console.error("Auth creation error:", authError);
        throw new Error(`Failed to create user: ${authError.message}`);
      }
    } else {
      // For guests and staff, use direct creation with password
      // Generate secure temporary password if not provided
      const finalPassword = password || generateTemporaryPassword(12);
      
      const createResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password: finalPassword,
        email_confirm: true,
        user_metadata: {
          full_name,
        },
      });

      authUser = createResult.data;
      authError = createResult.error;
      password = finalPassword; // Store the password for email sending

      if (authError) {
        console.error("Auth creation error:", authError);
        throw new Error(`Failed to create user: ${authError.message}`);
      }
    }

    if (!authUser.user) {
      throw new Error("Failed to create user: No user returned");
    }

    console.log("Auth user created/invited:", authUser.user.id);

    // No need to wait - we'll use upsert for role assignment

    // Update the profile created by the trigger with admin data and role-specific fields
    const profileData: any = {
      full_name,
      phone: phone || null,
      email,
      // Auto-assign admin's district and community (override trigger defaults)
      district_id: adminProfile?.district_id || null,
      community_id: adminProfile?.community_id || null,
      account_status: "approved",
    };

    // Set account status and role-specific fields based on role and creation method
    if (role === "resident") {
      profileData.account_status = "approved"; // Set to approved immediately
      if (unit_number) profileData.unit_number = unit_number;
      if (family_size) profileData.family_size = parseInt(family_size);
      if (emergency_contact_name)
        profileData.emergency_contact_name = emergency_contact_name;
      if (emergency_contact_phone)
        profileData.emergency_contact_phone = emergency_contact_phone;
    } else if (role === "guest") {
      profileData.account_status = "approved";
      // Guest users require expiration date
      if (access_expires_at) {
        profileData.access_expires_at = access_expires_at;
      } else {
        throw new Error("Guest users require an expiration date");
      }
      // Set default access level if not provided
      profileData.access_level = "basic";
    } else {
      profileData.account_status = "approved";
      if (role === "security_officer") {
        if (security_license_number)
          profileData.security_license_number = security_license_number;
        if (badge_id) profileData.badge_id = badge_id;
        if (shift_type) profileData.shift_type = shift_type;
      } else if (role === "maintenance_staff" || role === "facility_manager") {
        if (specialization) profileData.specialization = specialization;
        if (certifications)
          profileData.certifications = Array.isArray(certifications)
            ? certifications
            : [certifications];
        if (years_experience)
          profileData.years_experience = parseInt(years_experience);
      }
    }

    // Update the existing profile instead of inserting
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update(profileData)
      .eq("user_id", authUser.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Clean up auth user if profile update fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    console.log("Profile created successfully");

    // Upsert the role (insert or update if exists) to handle both trigger and direct creation scenarios
    const { error: roleUpsertError } = await supabaseAdmin
      .from("enhanced_user_roles")
      .insert({
        user_id: authUser.user.id,
        role: role,
        assigned_by: currentUser.id,
        district_id: adminProfile?.district_id || null,
        is_active: true,
        assigned_at: new Date().toISOString(),
      })
      .onConflict("user_id,role")
      .select();

    if (roleUpsertError) {
      console.error("Role upsert error:", roleUpsertError);
      console.error("Role upsert details:", {
        user_id: authUser.user.id,
        role: role,
        assigned_by: currentUser.id,
        district_id: adminProfile?.district_id || null,
      });
      // Clean up user and profile if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("user_id", authUser.user.id);
      throw new Error(`Failed to assign role: ${roleUpsertError.message}`);
    }

    console.log("Role assigned successfully");

    // Get admin's name for personalized emails
    const { data: adminProfile2, error: adminProfileError2 } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", currentUser.id)
      .single();
    
    const adminName = adminProfile2?.full_name || "Administrator";

    // Send appropriate email based on role and creation method
    try {
      await sendUserEmail({
        role,
        email,
        full_name,
        password: role === "resident" ? tempPassword : password,
        adminName,
        req,
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
          id: authUser.user.id,
          email: authUser.user.email,
          full_name,
          role,
        },
        invitation_sent: role === "resident",
        credentials_created: role !== "resident",
        email_sent: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
