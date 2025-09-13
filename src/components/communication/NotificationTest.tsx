import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { Bell, MessageSquare, Smartphone, Globe, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  created_by: string;
  sent_at: string;
  is_read: boolean;
  reference_id?: string;
  reference_table?: string;
}

export function NotificationTest() {
  const { user, language } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const {
    isInitialized,
    isSupported,
    permissionStatus,
    isSubscribed,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = useNotificationIntegration();

  useEffect(() => {
    if (!user?.id) return;

    // Fetch recent notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .order('sent_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification received:', payload.new);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return status ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* FCM Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            {language === 'en' ? 'FCM Integration Status' : 'Status Integrasi FCM'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(isInitialized)}
              <div>
                <div className="text-sm font-medium">
                  {language === 'en' ? 'Initialized' : 'Diinisialisasi'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isInitialized ? 'Ready' : 'Not Ready'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(isSupported)}
              <div>
                <div className="text-sm font-medium">
                  {language === 'en' ? 'Browser Support' : 'Sokongan Pelayar'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isSupported ? 'Supported' : 'Not Supported'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(permissionStatus === 'granted')}
              <div>
                <div className="text-sm font-medium">
                  {language === 'en' ? 'Permission' : 'Kebenaran'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {permissionStatus === 'granted' ? 'Granted' : 'Not Granted'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(isSubscribed)}
              <div>
                <div className="text-sm font-medium">
                  {language === 'en' ? 'Subscription' : 'Langganan'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isSubscribed ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {permissionStatus !== 'granted' && (
              <Button onClick={requestPermission} size="sm">
                {language === 'en' ? 'Request Permission' : 'Minta Kebenaran'}
              </Button>
            )}
            {permissionStatus === 'granted' && !isSubscribed && (
              <Button onClick={subscribe} size="sm">
                {language === 'en' ? 'Subscribe' : 'Langgan'}
              </Button>
            )}
            {isSubscribed && (
              <>
                <Button onClick={sendTestNotification} size="sm">
                  {language === 'en' ? 'Send Test Notification' : 'Hantar Notifikasi Ujian'}
                </Button>
                <Button onClick={unsubscribe} variant="outline" size="sm">
                  {language === 'en' ? 'Unsubscribe' : 'Batal Langgan'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Live Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {language === 'en' ? 'Live Notifications' : 'Notifikasi Langsung'}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {language === 'en' ? 'No notifications yet' : 'Belum ada notifikasi'}
              </p>
              <p className="text-xs mt-1">
                {language === 'en' 
                  ? 'Send a message in another tab to test notifications'
                  : 'Hantar mesej di tab lain untuk menguji notifikasi'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.is_read 
                      ? 'bg-muted/30 border-muted' 
                      : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs px-1">
                          {notification.notification_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.sent_at)}
                        </span>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
    </div>
  );
}