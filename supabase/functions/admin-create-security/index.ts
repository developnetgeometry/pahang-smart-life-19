import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  initializeAdminContext,
  createAuthUser,
  updateUserProfile,
  assignUserRole,
  checkModuleEnabled,
} from "../admin-user-utils/index.ts";

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
    const authUser = await createAuthUser(
      { email, password, full_name },
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