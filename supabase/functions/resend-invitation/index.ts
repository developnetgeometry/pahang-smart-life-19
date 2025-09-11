import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendInvitationRequest {
  user_id: string;
  redirect_url?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the requesting user has admin permissions
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin role
    const { data: adminRoles } = await supabaseAdmin
      .from('enhanced_user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['community_admin', 'district_coordinator', 'state_admin'])
      .eq('is_active', true);

    if (!adminRoles || adminRoles.length === 0) {
      throw new Error('Insufficient permissions');
    }

    const { user_id, redirect_url }: ResendInvitationRequest = await req.json();

    // Get user profile information
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email, account_status')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile) {
      throw new Error('User not found');
    }

    // Check if user is eligible for invitation resend
    if (profile.account_status === 'approved') {
      throw new Error('User is already approved');
    }

    const frontendUrl = redirect_url || 
      Deno.env.get("FRONTEND_URL") || 
      req.headers.get("origin") || 
      "http://localhost:3000";
    
    const redirectTo = `${frontendUrl}/complete-account`;

    // Resend invitation
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      profile.email,
      {
        redirectTo,
        data: {
          full_name: profile.full_name,
          signup_flow: 'invitation_resend'
        },
      }
    );

    if (inviteError) {
      throw new Error(`Failed to resend invitation: ${inviteError.message}`);
    }

    // Log the activity
    await supabaseAdmin.from('audit_logs').insert({
      table_name: 'profiles',
      action: 'resend_invitation',
      record_id: user_id,
      user_id: user.id,
      new_values: {
        email: profile.email,
        resent_at: new Date().toISOString()
      }
    });

    console.log(`Successfully resent invitation to ${profile.email} for user ${user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation resent successfully',
        user_email: profile.email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in resend-invitation function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});