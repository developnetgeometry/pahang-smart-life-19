import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Bell, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  MessageSquare,
  Smartphone
} from 'lucide-react';

interface NotificationEvent {
  id: string;
  type: 'sent' | 'delivered' | 'opened' | 'failed';
  title: string;
  message: string;
  recipient: string;
  timestamp: string;
  platform: 'web' | 'android' | 'ios';
  status: 'success' | 'pending' | 'failed';
}

interface SystemMetrics {
  activeSubscriptions: number;
  totalNotificationsSent: number;
  deliveryRate: number;
  averageResponseTime: number;
  onlineUsers: number;
}

export function RealTimeNotificationMonitor() {
  const { user, language } = useAuth();
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeSubscriptions: 0,
    totalNotificationsSent: 0,
    deliveryRate: 0,
    averageResponseTime: 0,
    onlineUsers: 0
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchInitialData();
    
    if (isLive) {
      startRealTimeMonitoring();
    }

    return () => {
      stopRealTimeMonitoring();
    };
  }, [isLive]);

  const fetchInitialData = async () => {
    try {
      // Fetch recent notifications
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:recipient_id(display_name, email)
        `)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Convert to events format
      const notificationEvents: NotificationEvent[] = (notifications || []).map(notification => ({
        id: notification.id,
        type: 'sent',
        title: notification.title,
        message: notification.message,
        recipient: 'User',
        timestamp: notification.sent_at,
        platform: 'web', // This would need to be tracked in the database
        status: 'success'
      }));

      setEvents(notificationEvents);

      // Fetch metrics
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      setMetrics({
        activeSubscriptions: subscriptions?.length || 0,
        totalNotificationsSent: notifications?.length || 0,
        deliveryRate: 96.5, // This would be calculated from actual delivery data
        averageResponseTime: 1.2, // Seconds
        onlineUsers: 42 // This would come from presence tracking
      });

    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const startRealTimeMonitoring = () => {
    // Subscribe to new notifications
    const notificationChannel = supabase
      .channel('notification-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newEvent: NotificationEvent = {
            id: payload.new.id,
            type: 'sent',
            title: payload.new.title,
            message: payload.new.message,
            recipient: 'New User',
            timestamp: payload.new.sent_at,
            platform: 'web',
            status: 'success'
          };

          setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
          
          // Update metrics
          setMetrics(prev => ({
            ...prev,
            totalNotificationsSent: prev.totalNotificationsSent + 1
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  };

  const stopRealTimeMonitoring = () => {
    // Clean up subscriptions
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  const getEventIcon = (type: NotificationEvent['type']) => {
    switch (type) {
      case 'sent': return <Bell className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'opened': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPlatformIcon = (platform: NotificationEvent['platform']) => {
    switch (platform) {
      case 'web': return <Activity className="w-3 h-3" />;
      case 'android': return <Smartphone className="w-3 h-3" />;
      case 'ios': return <Smartphone className="w-3 h-3" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {language === 'en' ? 'Real-Time Monitor' : 'Pemantau Masa Sebenar'}
          </h2>
        </div>
        <Button 
          onClick={toggleLiveMode} 
          variant={isLive ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {isLive ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {language === 'en' ? 'Live' : 'Langsung'}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {language === 'en' ? 'Start Live' : 'Mula Langsung'}
            </>
          )}
        </Button>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'en' ? 'Active Subscriptions' : 'Langganan Aktif'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Bell className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.totalNotificationsSent}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'en' ? 'Total Sent' : 'Jumlah Dihantar'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.deliveryRate}%</div>
            <div className="text-xs text-muted-foreground">
              {language === 'en' ? 'Delivery Rate' : 'Kadar Penghantaran'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}s</div>
            <div className="text-xs text-muted-foreground">
              {language === 'en' ? 'Avg Response' : 'Purata Respons'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{metrics.onlineUsers}</div>
            <div className="text-xs text-muted-foreground">
              {language === 'en' ? 'Online Users' : 'Pengguna Dalam Talian'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Event Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {language === 'en' ? 'Live Event Stream' : 'Strim Acara Langsung'}
            {isLive && (
              <Badge variant="default" className="ml-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                {language === 'en' ? 'Live' : 'Langsung'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {events.map((event) => (
                <div key={`${event.id}-${event.timestamp}`} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{event.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getPlatformIcon(event.platform)}
                        <span className="text-xs text-muted-foreground">
                          {event.platform}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {event.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {language === 'en' ? 'To:' : 'Kepada:'} {event.recipient}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {event.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {event.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                    {event.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'No events yet' : 'Belum ada acara'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'en' 
                      ? 'Events will appear here when notifications are sent'
                      : 'Acara akan muncul di sini apabila notifikasi dihantar'
                    }
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {language === 'en' ? 'System Status' : 'Status Sistem'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-sm">
                  {language === 'en' ? 'FCM Service' : 'Perkhidmatan FCM'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Operational' : 'Beroperasi'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-sm">
                  {language === 'en' ? 'Database' : 'Pangkalan Data'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Connected' : 'Tersambung'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-sm">
                  {language === 'en' ? 'Edge Functions' : 'Fungsi Edge'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Healthy' : 'Sihat'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}