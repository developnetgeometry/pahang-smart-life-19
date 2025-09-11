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

    console.log(`Attempting to resend invitation for user: ${user_id}`);

    // Get user profile information - try both id and user_id columns for robustness
    let profile, profileError;
    
    // First try with user_id column
    const profileResult1 = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, full_name, email, account_status, access_expires_at')
      .eq('user_id', user_id)
      .single();
    
    if (profileResult1.data) {
      profile = profileResult1.data;
      profileError = null;
    } else {
      // Fallback to id column
      const profileResult2 = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, full_name, email, account_status, access_expires_at')
        .eq('id', user_id)
        .single();
      
      profile = profileResult2.data;
      profileError = profileResult2.error;
    }

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      throw new Error('User not found');
    }

    console.log(`Found profile for ${profile.email}, status: ${profile.account_status}`);

    // Get user role to determine email type - use the correct user_id
    const actualUserId = profile.user_id || profile.id; // Use user_id if available, fallback to id
    const { data: userRoles } = await supabaseAdmin
      .from('enhanced_user_roles')
      .select('role')
      .eq('user_id', actualUserId)
      .eq('is_active', true);

    const isGuest = userRoles?.some(r => r.role === 'guest');
    
    const frontendUrl = redirect_url || 
      Deno.env.get("FRONTEND_URL") || 
      req.headers.get("origin") || 
      "http://localhost:3000";
    
    const redirectTo = `${frontendUrl}/complete-account`;

    let emailSentType = 'none';
    let emailResult = null;

    // Try invitation first, then fallback to password reset if email already exists
    try {
      console.log(`Attempting to invite user: ${profile.email}`);
      
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        profile.email,
        {
          redirectTo,
          data: {
            full_name: profile.full_name,
            signup_flow: 'invitation_resend',
            is_guest: isGuest,
            access_expires_at: profile.access_expires_at
          },
        }
      );

      if (inviteError) {
        // Check if it's "email already exists" error
        if (inviteError.message.includes('already been registered') || 
            inviteError.message.includes('email_exists') ||
            inviteError.status === 422) {
          
          console.log(`Email already registered, sending password reset instead: ${profile.email}`);
          
          // Use password reset for existing users
          const { data: resetData, error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
            profile.email,
            {
              redirectTo: redirectTo
            }
          );

          if (resetError) {
            throw new Error(`Failed to send password reset: ${resetError.message}`);
          }
          
          emailSentType = 'password_reset';
          emailResult = resetData;
        } else {
          throw inviteError;
        }
      } else {
        emailSentType = 'invitation';
        emailResult = inviteData;
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to resend invitation: ${error.message}`);
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

    console.log(`Successfully sent ${emailSentType} email to ${profile.email} for user ${user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${emailSentType === 'invitation' ? 'Invitation' : 'Password reset'} email sent successfully`,
        user_email: profile.email,
        email_type: emailSentType
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