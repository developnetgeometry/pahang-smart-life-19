import React, { useState } from 'react';
import { Bell, BellRing, Check, X, MessageSquare, AlertTriangle, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationSystem, NotificationData } from '@/hooks/use-notification-system';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function EnhancedNotificationBell() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading
  } = useNotificationSystem();

  const [isOpen, setIsOpen] = useState(false);

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
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type?: string, priority?: string) => {
    if (priority === 'high' || type === 'emergency') {
      return 'text-red-500';
    }
    switch (type) {
      case 'message':
        return 'text-blue-500';
      case 'event':
      case 'booking':
        return 'text-green-500';
      case 'announcement':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleNotificationClick = async (notification: NotificationData) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type or reference
    if (notification.reference_table === 'chat_messages' && notification.reference_id) {
      navigate(`/communication-hub?room=${notification.reference_id}`);
    } else if (notification.notification_type === 'booking') {
      navigate('/my-bookings');
    } else if (notification.notification_type === 'event') {
      navigate('/');
    } else if (notification.notification_type === 'complaint') {
      navigate('/my-complaints');
    } else {
      navigate('/');
    }

    setIsOpen(false);
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 rounded-full"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h4 className="font-semibold">
            {language === 'en' ? 'Notifications' : 'Notifikasi'}
          </h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              {language === 'en' ? 'Mark all read' : 'Tandai semua dibaca'}
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              {language === 'en' ? 'Loading notifications...' : 'Memuat notifikasi...'}
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {language === 'en' ? 'No notifications yet' : 'Belum ada notifikasi'}
              </p>
            </div>
          ) : (
            recentNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.notification_type);
              const iconColor = getNotificationColor(notification.notification_type, notification.priority);

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "p-0 cursor-pointer",
                    !notification.is_read && "bg-muted/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Card className="w-full border-none shadow-none">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className={cn("p-2 rounded-lg bg-muted", !notification.is_read && "bg-primary/10")}>
                          <IconComponent className={cn("h-4 w-4", iconColor)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className={cn(
                              "text-sm font-medium line-clamp-1",
                              !notification.is_read && "font-semibold"
                            )}>
                              {notification.title}
                            </h5>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <time className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.sent_at)}
                            </time>
                            {notification.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs px-1 py-0">
                                {language === 'en' ? 'High' : 'Tinggi'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>

        {recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="p-2 text-center text-sm text-primary cursor-pointer"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
            >
              {language === 'en' ? 'View all notifications' : 'Lihat semua notifikasi'}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}