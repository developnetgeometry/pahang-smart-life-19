import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
  user_ids: string[];
  action: 'approve' | 'reject' | 'bulk_approve';
  reason?: string;
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

    const { user_ids, action, reason }: ApprovalRequest = await req.json();

    if (!user_ids || user_ids.length === 0) {
      throw new Error('No user IDs provided');
    }

    const results = {
      successful: [] as string[],
      failed: [] as { user_id: string; error: string }[],
    };

    for (const userId of user_ids) {
      try {
        // Get current user profile
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('account_status, full_name, email')
          .eq('user_id', userId)
          .single();

        if (profileError || !profile) {
          results.failed.push({ user_id: userId, error: 'User not found' });
          continue;
        }

        // Update account status based on action
        let newStatus = 'pending';
        if (action === 'approve' || action === 'bulk_approve') {
          newStatus = 'approved';
        } else if (action === 'reject') {
          newStatus = 'rejected';
        }

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            account_status: newStatus,
            updated_at: new Date().toISOString(),
            ...(reason && { approval_notes: reason })
          })
          .eq('user_id', userId);

        if (updateError) {
          results.failed.push({ user_id: userId, error: updateError.message });
          continue;
        }

        // Create notification for the user
        if (action === 'approve' || action === 'bulk_approve') {
          await supabaseAdmin.from('notifications').insert({
            recipient_id: userId,
            title: 'Account Approved',
            message: 'Your account has been approved! You can now access the community platform.',
            notification_type: 'approval',
            category: 'account',
            sent_at: new Date().toISOString(),
            priority: 'normal'
          });
        } else if (action === 'reject') {
          await supabaseAdmin.from('notifications').insert({
            recipient_id: userId,
            title: 'Account Application Update',
            message: `Your account application has been reviewed. ${reason || 'Please contact the administrator for more information.'}`,
            notification_type: 'rejection',
            category: 'account',
            sent_at: new Date().toISOString(),
            priority: 'high'
          });
        }

        // Log the activity
        await supabaseAdmin.from('audit_logs').insert({
          table_name: 'profiles',
          action: `account_${action}`,
          record_id: userId,
          user_id: user.id,
          new_values: {
            account_status: newStatus,
            approved_by: user.id,
            approval_reason: reason,
            approved_at: new Date().toISOString()
          }
        });

        results.successful.push(userId);
        console.log(`Successfully ${action}d user ${userId} (${profile.email})`);

      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        results.failed.push({ user_id: userId, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${action} operation completed`,
        results: {
          successful: results.successful.length,
          failed: results.failed.length,
          details: results
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in approve-users function:', error);
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