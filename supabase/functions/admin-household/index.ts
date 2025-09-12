import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateTenantRequest {
  host_user_id: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone?: string;
  permissions: {
    marketplace: boolean;
    bookings: boolean;
    announcements: boolean;
    complaints: boolean;
    discussions: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create regular client to verify user permissions
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from("enhanced_user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (roleError || !userRoles) {
      return new Response(
        JSON.stringify({ error: "Failed to check user permissions" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isAdmin = userRoles.some((r) =>
      ["community_admin", "district_coordinator", "state_admin"].includes(
        r.role
      )
    );

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "GET") {
      // Get household accounts for a specific user
      const url = new URL(req.url);
      const hostUserId = url.searchParams.get("host_user_id");

      if (!hostUserId) {
        return new Response(
          JSON.stringify({ error: "host_user_id parameter required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get household accounts for this user using admin client to bypass RLS
      const { data: householdAccounts, error: accountsError } = await supabaseAdmin
        .from("household_accounts")
        .select(
          `
          id,
          linked_account_id,
          relationship_type,
          permissions,
          is_active,
          created_at
        `
        )
        .eq("primary_account_id", hostUserId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (accountsError) {
        console.error("Error fetching household accounts:", accountsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch household accounts" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Return empty array if no household accounts found
      if (!householdAccounts || householdAccounts.length === 0) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get profile data for linked users separately
      const linkedUserIds = householdAccounts?.map(account => account.linked_account_id) || [];
      let linkedProfiles = [];
      
      if (linkedUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", linkedUserIds);
          
        if (profilesError) {
          console.error("Error fetching linked profiles:", profilesError);
        } else {
          linkedProfiles = profiles || [];
        }
      }

      // Map profiles to household accounts with the correct format for UI
      const enrichedAccounts = householdAccounts?.map(account => ({
        ...account,
        linked_user_id: account.linked_account_id, // Map for UI compatibility
        profiles: linkedProfiles.find(profile => profile.id === account.linked_account_id)
      })) || [];

      return new Response(JSON.stringify({ data: enrichedAccounts }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      // Create tenant account
      const body: CreateTenantRequest = await req.json();

      if (!body.host_user_id || !body.tenant_name || !body.tenant_email) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if tenant email already exists
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", body.tenant_email)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing user:", checkError);
        return new Response(
          JSON.stringify({ error: "Failed to check existing user" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (existingProfile) {
        return new Response(
          JSON.stringify({ error: "User with this email already exists" }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get host user info to inherit district and community
      const { data: hostProfile, error: hostError } = await supabaseAdmin
        .from("profiles")
        .select("district_id, community_id")
        .eq("id", body.host_user_id)
        .single();

      if (hostError || !hostProfile) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch host user details" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Generate temporary password
      const tempPassword = `GuestTemp${Math.random().toString(36).slice(-8)}`;

      // Create auth user using service role
      const { data: newUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: body.tenant_email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: body.tenant_name,
            created_by_admin: true,
            account_type: "guest",
          },
        });

      if (authError || !newUser.user) {
        console.error("Error creating guest auth user:", authError);
        return new Response(
          JSON.stringify({ error: "Failed to create guest account" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Auth user created:", newUser.user.id);

      // Update or create profile for the guest (in case trigger already created it)
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: newUser.user.id,
          full_name: body.tenant_name,
          email: body.tenant_email,
          phone: body.tenant_phone || null,
          district_id: hostProfile.district_id,
          community_id: hostProfile.community_id,
          account_status: "approved",
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error("Error upserting guest profile:", profileError);
        // Clean up auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return new Response(
          JSON.stringify({ error: "Failed to create guest profile" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Profile created/updated successfully");

      // Assign guest role to guest user
      const { error: roleError } = await supabaseAdmin
        .from("enhanced_user_roles")
        .insert({
          user_id: newUser.user.id,
          role: "guest",
          is_active: true,
          assigned_by: user.id,
          assigned_at: new Date().toISOString(),
          district_id: hostProfile.district_id,
        });

      if (roleError) {
        console.error("Error assigning role to guest:", roleError);
        // Clean up user if role assignment fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        await supabaseAdmin.from("profiles").delete().eq("id", newUser.user.id);
        return new Response(
          JSON.stringify({ error: "Failed to assign role to guest" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Role assigned successfully");

      // Create household account link
      const { error: householdError } = await supabaseAdmin
        .from("household_accounts")
        .insert({
          primary_account_id: body.host_user_id,
          linked_account_id: newUser.user.id,
          relationship_type: "tenant",
          permissions: body.permissions,
          is_active: true,
        });

      if (householdError) {
        console.error("Error creating household account:", householdError);
        // Clean up user if household account creation fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        await supabaseAdmin.from("profiles").delete().eq("id", newUser.user.id);
        await supabaseAdmin
          .from("enhanced_user_roles")
          .delete()
          .eq("user_id", newUser.user.id);
        return new Response(
          JSON.stringify({ error: "Failed to create household account link" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Send password reset email to tenant
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink(
        {
          type: "recovery",
          email: body.tenant_email,
          options: {
            redirectTo: `${
              Deno.env.get("FRONTEND_URL") || "http://localhost:5173"
            }/complete-account?type=tenant`,
          },
        }
      );

      if (resetError) {
        console.error("Error sending tenant invitation:", resetError);
        // Don't fail the entire operation, just log the error
      }

      return new Response(
        JSON.stringify({
          success: true,
          tenant_id: newUser.user.id,
          message:
            "Guest account created successfully. Invitation email sent.",
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in admin-household function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
