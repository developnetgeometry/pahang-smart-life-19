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

    const {
      email,
      password,
      full_name,
      phone,
      role, // facility_manager or maintenance_staff
      specialization,
      certifications,
      years_experience,
    } = await req.json();

    // Validate role
    if (!["facility_manager", "maintenance_staff"].includes(role)) {
      throw new Error("Invalid role. Must be facility_manager or maintenance_staff");
    }

    // Check if facilities module is enabled
    const facilitiesEnabled = await checkModuleEnabled("facilities", context);
    if (!facilitiesEnabled) {
      throw new Error(
        "Facilities module is disabled. Cannot create Facility Manager or Maintenance Staff accounts."
      );
    }

    console.log(`Creating ${role} with data:`, {
      email,
      full_name,
      specialization,
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

    // Prepare facility staff profile data
    const profileData: any = {
      full_name,
      phone: phone || null,
      email,
      district_id: context.adminProfile?.district_id || null,
      community_id: context.adminProfile?.community_id || null,
      account_status: "approved", // Staff are auto-approved
    };

    // Add facility-specific fields
    if (specialization) profileData.specialization = specialization;
    if (certifications) {
      profileData.certifications = Array.isArray(certifications)
        ? certifications
        : [certifications];
    }
    if (years_experience) profileData.years_experience = parseInt(years_experience);

    // Update profile with facility staff data
    await updateUserProfile(authUser.user.id, profileData, context);
    console.log(`${role} profile updated successfully`);

    // Assign role
    await assignUserRole(authUser.user.id, role, context);
    console.log(`${role} role assigned successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          full_name,
          role,
          specialization,
          certifications,
          years_experience,
        },
        credentials_created: true,
        message: `${role.replace('_', ' ')} account created successfully.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Create facility staff error:`, error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create facility staff account",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});