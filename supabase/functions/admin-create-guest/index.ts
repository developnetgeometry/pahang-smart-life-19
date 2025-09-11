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
      password,
      full_name,
      phone,
      access_expires_at,
    } = await req.json();

    // Validate required fields for guests
    if (!access_expires_at) {
      throw new Error("Guest users require an expiration date");
    }

    console.log("Creating guest with data:", {
      email,
      full_name,
      access_expires_at,
      admin_community: context.adminProfile?.community_id,
    });

    // Create auth user with direct creation (guests get immediate access)
    const authUser = await createAuthUser(
      { email, password, full_name },
      false, // Direct creation for guests
      context,
      req
    );

    console.log("Auth user created:", authUser.user.id);

    // Prepare guest profile data
    const profileData: any = {
      full_name,
      phone: phone || null,
      email,
      district_id: context.adminProfile?.district_id || null,
      community_id: context.adminProfile?.community_id || null,
      account_status: "approved", // Guests are auto-approved
      access_expires_at,
      access_level: "basic", // Default access level for guests
    };

    // Update profile with guest data
    await updateUserProfile(authUser.user.id, profileData, context);
    console.log("Guest profile updated successfully");

    // Assign guest role (if you have a guest role, otherwise can be omitted)
    // For now, guests might not need a specific role assignment
    // await assignUserRole(authUser.user.id, "guest", context);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
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
    console.error("Create guest error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create guest account",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});