import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bell, AlertTriangle, Clock, User, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ComplaintNotification {
  id: string;
  complaint_id: string;
  notification_type: string; // Allow any string since it comes from database
  sent_at: string;
  read_at: string | null;
  metadata: any; // Use any for JSONB data
  complaints: {
    title: string;
    category: string;
    priority: string;
    status: string;
    escalation_level: number;
  } | null;
}

export default function RealTimeNotificationCenter() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ComplaintNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const text = {
    en: {
      title: 'Complaint Notifications',
      noNotifications: 'No notifications yet',
      markAllRead: 'Mark All Read',
      new: 'New',
      escalated: 'Escalated',
      priority: {
        low: 'Low',
        medium: 'Medium', 
        high: 'High'
      },
      status: {
        pending: 'Pending',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        closed: 'Closed'
      },
      types: {
        created: 'New complaint submitted',
        assigned: 'Complaint assigned to you',
        updated: 'Complaint status updated',
        escalated: 'Complaint escalated',
        resolved: 'Complaint resolved'
      }
    },
    ms: {
      title: 'Notifikasi Aduan',
      noNotifications: 'Tiada notifikasi lagi',
      markAllRead: 'Tandakan Semua Dibaca',
      new: 'Baru',
      escalated: 'Dinaiktaraf',
      priority: {
        low: 'Rendah',
        medium: 'Sederhana',
        high: 'Tinggi'
      },
      status: {
        pending: 'Menunggu',
        in_progress: 'Dalam Proses',
        resolved: 'Diselesaikan',
        closed: 'Ditutup'
      },
      types: {
        created: 'Aduan baru dihantar',
        assigned: 'Aduan ditugaskan kepada anda',
        updated: 'Status aduan dikemaskini',
        escalated: 'Aduan dinaiktaraf',
        resolved: 'Aduan diselesaikan'
      }
    }
  };

  const t = text[language];

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Set up real-time subscription for complaint notifications
    const channel = supabase
      .channel('complaint-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'complaint_notifications',
        filter: `recipient_id=eq.${user.id}`
      }, (payload) => {
        console.log('New complaint notification:', payload);
        fetchNotifications(); // Refresh notifications
        
        // Show toast for new notifications
        toast({
          title: t.types.created,
          description: 'You have a new complaint notification',
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'complaint_notifications',
        filter: `recipient_id=eq.${user.id}`
      }, (payload) => {
        console.log('Complaint notification updated:', payload);
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, t.types.created]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('complaint_notifications')
        .select(`
          *,
          complaints (
            title,
            category,
            priority,
            status,
            escalation_level
          )
        `)
        .eq('recipient_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read_at).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_complaint_notification_read', {
        notification_id: notificationId
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      
      await Promise.all(
        unreadNotifications.map(n => 
          supabase.rpc('mark_complaint_notification_read', {
            notification_id: n.id
          })
        )
      );

      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);

      toast({
        title: language === 'en' ? 'All notifications marked as read' : 'Semua notifikasi ditandakan dibaca',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string, escalationLevel: number) => {
    if (escalationLevel > 0) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    
    switch (type) {
      case 'created': return <Bell className="h-4 w-4 text-blue-500" />;
      case 'assigned': return <User className="h-4 w-4 text-green-500" />;
      case 'updated': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 flex-1 min-w-0">
            <Bell className="h-5 w-5 shrink-0" />
            <span className="truncate">{t.title}</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="shrink-0">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="shrink-0">
              {t.markAllRead}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t.noNotifications}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <div 
                    className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      !notification.read_at 
                        ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => !notification.read_at && markAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(
                        notification.notification_type, 
                        notification.complaints?.escalation_level || 0
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {notification.complaints?.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          {!notification.read_at && (
                            <Badge variant="secondary" className="text-xs">
                              {t.new}
                            </Badge>
                          )}
                          {(notification.complaints?.escalation_level || 0) > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {t.escalated} L{notification.complaints?.escalation_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.types[notification.notification_type as keyof typeof t.types] || notification.notification_type} • {notification.complaints?.category}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`text-xs text-white ${getPriorityColor(notification.complaints?.priority || 'medium')}`}
                          >
                            {t.priority[notification.complaints?.priority as keyof typeof t.priority] || notification.complaints?.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t.status[notification.complaints?.status as keyof typeof t.status] || notification.complaints?.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.sent_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}