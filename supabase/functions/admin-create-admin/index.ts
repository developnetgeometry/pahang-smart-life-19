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
      role, // community_admin, district_coordinator, state_admin
      district_id, // for specific assignments
      community_id, // for specific assignments
    } = await req.json();

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
    const isDistrictCoordinator = context.adminProfile && 
      await context.supabase
        .from("enhanced_user_roles")
        .select("role")
        .eq("user_id", context.currentUser.id)
        .eq("role", "district_coordinator")
        .eq("is_active", true)
        .single();

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
    const authUser = await createAuthUser(
      { email, password, full_name },
      false, // Direct creation for admin staff
      context,
      req
    );

    console.log("Auth user created:", authUser.user.id);

    // Prepare admin profile data
    const profileData: any = {
      full_name,
      phone: phone || null,
      email,
      account_status: "approved", // Admins are auto-approved
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
    await updateUserProfile(authUser.user.id, profileData, context);
    console.log(`${role} profile updated successfully`);

    // Assign admin role
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
          district_id: profileData.district_id,
          community_id: profileData.community_id,
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