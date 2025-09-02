import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CommunicationStats {
  activeUsers: number;
  onlineUsers: number;
  unreadMessages: number;
  todayAnnouncements: number;
  recentCalls: number;
  voiceMessages: number;
  fileShares: number;
  lastUpdated: string;
}

export const useCommunicationStats = () => {
  const [stats, setStats] = useState<CommunicationStats>({
    activeUsers: 0,
    onlineUsers: 0,
    unreadMessages: 0,
    todayAnnouncements: 0,
    recentCalls: 0,
    voiceMessages: 0,
    fileShares: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunicationStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch real-time stats from edge function
      const { data, error: functionError } = await supabase.functions.invoke('communication-stats');
      
      if (functionError) {
        console.error('Edge function error:', functionError);
        throw functionError;
      }

      if (data) {
        setStats({
          activeUsers: data.active_users || 0,
          onlineUsers: data.online_users || 0,
          unreadMessages: data.unread_messages || 0,
          todayAnnouncements: data.today_announcements || 0,
          recentCalls: data.recent_calls || 0,
          voiceMessages: data.voice_messages || 0,
          fileShares: data.file_shares || 0,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error fetching communication stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      
      // Fallback to basic database queries if edge function fails
      try {
        const [announcementsResult, messagesResult, presenceResult] = await Promise.all([
          // Today's announcements
          supabase
            .from('announcements')
            .select('id')
            .gte('created_at', new Date().toISOString().split('T')[0])
            .eq('is_published', true),
          
          // Recent messages (last 24 hours)
          supabase
            .from('chat_messages')
            .select('id')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          
          // Online users (active in last 5 minutes)
          supabase
            .from('user_presence')
            .select('id')
            .eq('status', 'online')
            .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        ]);

        setStats({
          activeUsers: messagesResult.data?.length || 0,
          onlineUsers: presenceResult.data?.length || 0,
          unreadMessages: 0, // Would need more complex query
          todayAnnouncements: announcementsResult.data?.length || 0,
          recentCalls: 0, // Would need video_calls table
          voiceMessages: 0, // Would need voice_messages table
          fileShares: 0, // Would need file_shares table
          lastUpdated: new Date().toISOString()
        });
        
        setError(null);
      } catch (fallbackError) {
        console.error('Fallback queries also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunicationStats();

    // Set up real-time subscription for chat messages
    const channel = supabase
      .channel('communication-stats')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, () => {
        // Refetch stats when new messages arrive
        fetchCommunicationStats();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'announcements'
      }, () => {
        // Refetch stats when new announcements are published
        fetchCommunicationStats();
      })
      .subscribe();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchCommunicationStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { stats, isLoading, error, refetch: fetchCommunicationStats };
};