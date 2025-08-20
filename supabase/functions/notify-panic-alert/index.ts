import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PanicAlertData {
  panicAlertId: string;
  userLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  userName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { panicAlertId, userLocation, userName }: PanicAlertData = await req.json();

    console.log('Processing panic alert:', { panicAlertId, userName, location: userLocation });

    // Get all security personnel and administrators
    const { data: securityUsers, error: securityError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role
      `)
      .in('role', ['security', 'admin', 'state_admin', 'district_coordinator', 'community_admin']);

    if (securityError) {
      console.error('Error fetching security users:', securityError);
      throw securityError;
    }

    console.log('Found security users:', securityUsers?.length);

    // Create location string
    const locationString = userLocation?.address || 
      (userLocation ? `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}` : 'Location unavailable');

    // Create notifications for all security personnel
    const notifications = securityUsers?.map(user => ({
      recipient_id: user.user_id,
      title: '🚨 EMERGENCY PANIC ALERT',
      message: `Emergency alert triggered by ${userName}. Location: ${locationString}. Immediate response required.`,
      type: 'panic',
      priority: 'critical',
      data: {
        panic_alert_id: panicAlertId,
        user_name: userName,
        location: userLocation,
        timestamp: new Date().toISOString()
      }
    })) || [];

    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        throw notificationError;
      }

      console.log('Created notifications for', notifications.length, 'security personnel');
    }

    // Log the panic alert for audit purposes
    console.log('Panic alert processed successfully:', {
      alertId: panicAlertId,
      notificationsSent: notifications.length,
      location: locationString,
      timestamp: new Date().toISOString()
    });

    // In a real implementation, you might also want to:
    // - Send push notifications
    // - Send SMS alerts
    // - Trigger automated systems
    // - Log to external security systems

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Panic alert processed successfully',
        notificationsSent: notifications.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in notify-panic-alert function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to process panic alert'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});