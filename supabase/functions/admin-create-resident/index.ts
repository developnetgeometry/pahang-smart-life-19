import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  initializeAdminContext,
  createAuthUser,
  updateUserProfile,
  assignUserRole,
} from "../admin-user-utils/index.ts";

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

    console.log("Creating resident with data:", {
      email,
      full_name,
      unit_number,
      admin_community: context.adminProfile?.community_id,
    });

    // Create auth user using invite flow
    const authUser = await createAuthUser(
      { email, full_name },
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