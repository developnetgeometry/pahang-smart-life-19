import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/utils/notificationService';
import { useToast } from '@/components/ui/use-toast';

export interface NotificationData {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  notification_type?: string;
  category?: string;
  is_read?: boolean;
  sent_at?: string;
  read_at?: string;
  priority?: string;
  reference_id?: string;
  reference_table?: string;
  district_id?: string;
  created_by?: string;
  created_at?: string;
  expires_at?: string;
  sender_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface NotificationPreferences {
  announcements?: boolean;
  bookings?: boolean;
  complaints?: boolean;
  events?: boolean;
  maintenance?: boolean;
  security?: boolean;
  messages?: boolean;
  mentions?: boolean;
  emergencies?: boolean;
  marketplace?: boolean;
}

export const useNotificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's notification preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPreferences(data || {
        announcements: true,
        bookings: true,
        complaints: true,
        events: true,
        maintenance: true,
        security: true,
        messages: true,
        mentions: true,
        emergencies: true,
        marketplace: true,
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [user]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (limit = 50) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const enhancedNotifications: NotificationData[] = (data || []).map(notification => ({
        ...notification,
      }));

      setNotifications(enhancedNotifications);
      setUnreadCount(enhancedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user]);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, ...newPreferences } as NotificationPreferences));
      
      toast({
        title: 'Success',
        description: 'Notification preferences updated',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Send notification to specific users
  const sendNotification = useCallback(async (
    title: string,
    message: string,
    recipientIds: string[],
    options?: {
      notificationType?: string;
      url?: string;
      senderId?: string;
    }
  ) => {
    if (!user) return false;

    try {
      // Insert notifications into database
      const notifications = recipientIds.map(recipientId => ({
        recipient_id: recipientId,
        title,
        message,
        notification_type: options?.notificationType || 'general',
        category: options?.notificationType || 'general',
        created_by: options?.senderId || user.id,
        is_read: false,
        sent_at: new Date().toISOString(),
      }));

      const { error: dbError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (dbError) throw dbError;

      // Send push notifications
      const notificationService = NotificationService.getInstance();
      await notificationService.sendNotification(title, message, {
        userIds: recipientIds,
        notificationType: options?.notificationType,
        url: options?.url,
      });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }, [user]);

  // Send message notification (for chat system integration)
  const sendMessageNotification = useCallback(async (
    recipientId: string,
    senderName: string,
    messagePreview: string,
    roomId: string,
    isMarketplaceChat = false
  ) => {
    if (!user || recipientId === user.id) return;

    const title = isMarketplaceChat 
      ? `New message about your product` 
      : `New message from ${senderName}`;
    
    const message = `${senderName}: ${messagePreview}`;
    
    await sendNotification(
      title,
      message,
      [recipientId],
      {
        notificationType: 'message',
        url: `/communication-hub?room=${roomId}`,
        senderId: user.id,
      }
    );
  }, [user, sendNotification]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          const newNotification = payload.new as any;
          
          // Fetch complete notification
          const { data: completeNotification } = await supabase
            .from('notifications')
            .select('*')
            .eq('id', newNotification.id)
            .single();

          if (completeNotification) {
            const enhancedNotification: NotificationData = {
              ...completeNotification,
            };

            setNotifications(prev => [enhancedNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast for important notifications
            if (newNotification.notification_type === 'emergency' || newNotification.notification_type === 'message') {
              toast({
                title: newNotification.title,
                description: newNotification.message,
                duration: 5000,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as NotificationData;
          setNotifications(prev =>
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
          
          if (updatedNotification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [user, fetchNotifications, fetchPreferences]);

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    sendNotification,
    sendMessageNotification,
    fetchNotifications,
  };
};