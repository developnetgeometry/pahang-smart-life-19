import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Communication stats function called');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: authHeader } 
        } 
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's district
    const { data: profile } = await supabase
      .from('profiles')
      .select('district_id')
      .eq('id', user.id)
      .single();

    const districtId = profile?.district_id;

    console.log('Fetching communication statistics...');

    // Get active users (users who sent messages in last 24 hours)
    const { data: activeUsers } = await supabase
      .from('chat_messages')
      .select('sender_id', { count: 'estimated' })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .eq('room_id', districtId ? `district-${districtId}` : 'general');

    // Get online users count
    const { data: onlineUsers } = await supabase
      .from('user_presence')
      .select('user_id', { count: 'estimated' })
      .in('status', ['online', 'busy']);

    // Get unread messages count for current user
    const { data: unreadMessages } = await supabase
      .from('chat_messages')
      .select('id', { count: 'estimated' })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Get today's announcements
    const { data: todayAnnouncements } = await supabase
      .from('announcements')
      .select('id', { count: 'estimated' })
      .gte('created_at', new Date().toDateString())
      .eq('district_id', districtId);

    // Get recent video calls
    const { data: recentCalls } = await supabase
      .from('video_calls')
      .select('id', { count: 'estimated' })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Get voice messages count
    const { data: voiceMessages } = await supabase
      .from('voice_messages')
      .select('id', { count: 'estimated' })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Get file shares count
    const { data: fileShares } = await supabase
      .from('file_shares')
      .select('id', { count: 'estimated' })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const stats = {
      activeUsers: activeUsers?.length || 0,
      onlineUsers: onlineUsers?.length || 0,
      unreadMessages: unreadMessages?.length || 0,
      todayAnnouncements: todayAnnouncements?.length || 0,
      recentCalls: recentCalls?.length || 0,
      voiceMessages: voiceMessages?.length || 0,
      fileShares: fileShares?.length || 0,
      lastUpdated: new Date().toISOString()
    };

    console.log('Communication statistics retrieved successfully');

    return new Response(
      JSON.stringify(stats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in communication-stats:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});