import React, { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Settings, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  AlertTriangle, 
  Calendar, 
  Users,
  Package,
  FileText,
  Wrench
} from 'lucide-react';
import { useNotificationSystem, NotificationData } from '@/hooks/use-notification-system';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function NotificationPage() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    isLoading
  } = useNotificationSystem();

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'emergency':
        return AlertTriangle;
      case 'event':
        return Calendar;
      case 'booking':
        return Calendar;
      case 'announcement':
        return Users;
      case 'marketplace':
        return Package;
      case 'complaint':
        return FileText;
      case 'maintenance':
        return Wrench;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type?: string, priority?: string) => {
    if (priority === 'high' || type === 'emergency') {
      return 'text-red-500 bg-red-50';
    }
    switch (type) {
      case 'message':
        return 'text-blue-500 bg-blue-50';
      case 'event':
      case 'booking':
        return 'text-green-500 bg-green-50';
      case 'announcement':
        return 'text-purple-500 bg-purple-50';
      case 'marketplace':
        return 'text-orange-500 bg-orange-50';
      case 'complaint':
        return 'text-yellow-500 bg-yellow-50';
      case 'maintenance':
        return 'text-gray-500 bg-gray-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const handleNotificationClick = async (notification: NotificationData) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.notification_type === 'message') {
      if (notification.reference_id) {
        navigate(`/communication-hub?room=${notification.reference_id}`);
      } else {
        navigate('/communication-hub');
      }
    } else if (notification.notification_type === 'booking') {
      navigate('/my-bookings');
    } else if (notification.notification_type === 'event') {
      navigate('/');
    } else if (notification.notification_type === 'complaint') {
      navigate('/my-complaints');
    } else if (notification.notification_type === 'marketplace') {
      navigate('/marketplace');
    } else {
      navigate('/');
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.is_read);

  const handlePreferenceChange = (key: string, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">
                {language === 'en' ? 'Notifications' : 'Notifikasi'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` 
                  : `${unreadCount} notifikasi belum dibaca`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Settings' : 'Pengaturan'}
            </Button>
            
            {unreadCount > 0 && (
              <Button size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Mark all read' : 'Tandai semua dibaca'}
              </Button>
            )}
          </div>
        </div>

        {showSettings && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {language === 'en' ? 'Notification Preferences' : 'Preferensi Notifikasi'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferences && Object.entries(preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="capitalize">
                    {language === 'en' ? key.replace(/([A-Z])/g, ' $1') : key}
                  </Label>
                  <Switch
                    id={key}
                    checked={!!value}
                    onCheckedChange={(checked) => handlePreferenceChange(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            {language === 'en' ? 'All' : 'Semua'}
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            {language === 'en' ? 'Unread' : 'Belum dibaca'} ({unreadCount})
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Loading notifications...' : 'Memuat notifikasi...'}
                  </p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">
                    {filter === 'unread' 
                      ? (language === 'en' ? 'No unread notifications' : 'Tidak ada notifikasi belum dibaca')
                      : (language === 'en' ? 'No notifications yet' : 'Belum ada notifikasi')
                    }
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'en' 
                      ? "You'll see notifications here when there are updates"
                      : 'Notifikasi akan muncul di sini ketika ada pembaruan'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.notification_type);
                    const colorClasses = getNotificationColor(notification.notification_type, notification.priority);

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                          !notification.is_read && "bg-muted/30"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-4">
                          <div className={cn("p-3 rounded-lg", colorClasses)}>
                            <IconComponent className="h-5 w-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={cn(
                                    "font-medium line-clamp-1",
                                    !notification.is_read && "font-semibold"
                                  )}>
                                    {notification.title}
                                  </h4>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                  )}
                                </div>

                                <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                                  {notification.message}
                                </p>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <time>{formatTimeAgo(notification.sent_at)}</time>
                                  
                                  {notification.category && (
                                    <Badge variant="secondary" className="text-xs">
                                      {notification.category}
                                    </Badge>
                                  )}
                                  
                                  {notification.priority === 'high' && (
                                    <Badge variant="destructive" className="text-xs">
                                      {language === 'en' ? 'High Priority' : 'Prioritas Tinggi'}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="flex-shrink-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
  );
}