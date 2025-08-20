import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, CheckCheck, AlertTriangle, Info, MessageSquare, Calendar, Settings } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'announcement' | 'event' | 'message';
  read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
}

export default function Notifications() {
  const { user, language } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      // For now, we'll use mock data since notifications system isn't fully implemented
      loadMockNotifications();
    }
  }, [user]);

  const loadMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: language === 'en' ? 'New Community Announcement' : 'Pengumuman Komuniti Baru',
        message: language === 'en' ? 'Monthly maintenance scheduled for this weekend' : 'Penyelenggaraan bulanan dijadualkan untuk hujung minggu ini',
        type: 'announcement',
        read: false,
        created_at: '2024-01-15T10:00:00Z',
        priority: 'high'
      },
      {
        id: '2',
        title: language === 'en' ? 'Booking Confirmed' : 'Tempahan Disahkan',
        message: language === 'en' ? 'Your swimming pool booking for tomorrow has been confirmed' : 'Tempahan kolam renang anda untuk esok telah disahkan',
        type: 'success',
        read: false,
        created_at: '2024-01-14T15:30:00Z',
        priority: 'medium'
      },
      {
        id: '3',
        title: language === 'en' ? 'Payment Reminder' : 'Peringatan Pembayaran',
        message: language === 'en' ? 'Monthly maintenance fee payment is due in 3 days' : 'Bayaran yuran penyelenggaraan bulanan perlu dibayar dalam 3 hari',
        type: 'warning',
        read: true,
        created_at: '2024-01-13T09:00:00Z',
        priority: 'high'
      },
      {
        id: '4',
        title: language === 'en' ? 'New Message' : 'Mesej Baru',
        message: language === 'en' ? 'You have received a new message from the community admin' : 'Anda telah menerima mesej baru dari admin komuniti',
        type: 'message',
        read: false,
        created_at: '2024-01-12T14:20:00Z',
        priority: 'medium'
      },
      {
        id: '5',
        title: language === 'en' ? 'Upcoming Event' : 'Acara Akan Datang',
        message: language === 'en' ? 'Community BBQ event this Saturday at 6 PM' : 'Acara BBQ komuniti Sabtu ini pada jam 6 petang',
        type: 'event',
        read: true,
        created_at: '2024-01-11T11:00:00Z',
        priority: 'low'
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const filterNotifications = (filter: string) => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <div className="p-6">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            {language === 'en' ? 'Notifications' : 'Pemberitahuan'}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Stay updated with community news and activities' : 'Kekal dikemas kini dengan berita dan aktiviti komuniti'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Mark All Read' : 'Tanda Semua Dibaca'}
            </Button>
          )}
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Settings' : 'Tetapan'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            {language === 'en' ? 'All' : 'Semua'} ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            {language === 'en' ? 'Unread' : 'Belum Dibaca'} ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            {language === 'en' ? 'Read' : 'Telah Dibaca'} ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filterNotifications(activeTab).map((notification) => (
              <Card 
                key={notification.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {notification.title}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getPriorityBadge(notification.priority)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {notification.message}
                  </CardDescription>
                  {notification.action_url && (
                    <Button size="sm" className="mt-3">
                      {language === 'en' ? 'View Details' : 'Lihat Butiran'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {filterNotifications(activeTab).length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === 'unread' 
                      ? (language === 'en' ? 'No unread notifications' : 'Tiada pemberitahuan belum dibaca')
                      : activeTab === 'read'
                      ? (language === 'en' ? 'No read notifications' : 'Tiada pemberitahuan telah dibaca')
                      : (language === 'en' ? 'No notifications' : 'Tiada pemberitahuan')
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'You\'re all caught up! Check back later for updates.'
                      : 'Anda sudah terkini! Periksa semula kemudian untuk kemaskini.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}