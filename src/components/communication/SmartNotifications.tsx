import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Bell,
  BellOff,
  AlertTriangle,
  MessageSquare,
  Phone,
  Users,
  Calendar,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  Filter,
  X
} from 'lucide-react';

interface NotificationPreference {
  id: string;
  type: 'chat' | 'call' | 'announcement' | 'emergency' | 'event' | 'maintenance';
  label: string;
  description: string;
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  action: 'notify' | 'silent' | 'urgent';
  timeRange?: { start: string; end: string };
  keywords?: string[];
  users?: string[];
}

interface SmartNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  actions?: { label: string; action: () => void }[];
  metadata?: any;
}

export default function SmartNotifications() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'chat',
      type: 'chat',
      label: language === 'en' ? 'Chat Messages' : 'Mesej Chat',
      description: language === 'en' ? 'New messages in community chat' : 'Mesej baru dalam chat komuniti',
      enabled: true,
      sound: true,
      vibration: false,
      priority: 'normal'
    },
    {
      id: 'call',
      type: 'call',
      label: language === 'en' ? 'Video Calls' : 'Panggilan Video',
      description: language === 'en' ? 'Incoming video calls and invitations' : 'Panggilan video masuk dan jemputan',
      enabled: true,
      sound: true,
      vibration: true,
      priority: 'high'
    },
    {
      id: 'announcement',
      type: 'announcement',
      label: language === 'en' ? 'Announcements' : 'Pengumuman',
      description: language === 'en' ? 'Community and management announcements' : 'Pengumuman komuniti dan pengurusan',
      enabled: true,
      sound: false,
      vibration: false,
      priority: 'normal'
    },
    {
      id: 'emergency',
      type: 'emergency',
      label: language === 'en' ? 'Emergency Alerts' : 'Amaran Kecemasan',
      description: language === 'en' ? 'Critical safety and security alerts' : 'Amaran kritikal keselamatan dan keamanan',
      enabled: true,
      sound: true,
      vibration: true,
      priority: 'urgent'
    },
    {
      id: 'event',
      type: 'event',
      label: language === 'en' ? 'Community Events' : 'Acara Komuniti',
      description: language === 'en' ? 'Event reminders and updates' : 'Peringatan dan kemas kini acara',
      enabled: true,
      sound: false,
      vibration: false,
      priority: 'low'
    },
    {
      id: 'maintenance',
      type: 'maintenance',
      label: language === 'en' ? 'Maintenance Updates' : 'Kemas Kini Penyelenggaraan',
      description: language === 'en' ? 'Facility maintenance notifications' : 'Notifikasi penyelenggaraan kemudahan',
      enabled: true,
      sound: false,
      vibration: false,
      priority: 'normal'
    }
  ]);

  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [quietHours, setQuietHours] = useState({ enabled: false, start: '22:00', end: '08:00' });
  const [smartFiltering, setSmartFiltering] = useState(true);

  // Mock notifications for demo
  useEffect(() => {
    const mockNotifications: SmartNotification[] = [
      {
        id: '1',
        type: 'emergency',
        title: language === 'en' ? 'Emergency Alert' : 'Amaran Kecemasan',
        message: language === 'en' ? 'Fire alarm activated in Block A. Please evacuate immediately.' : 'Penggera kebakaran diaktifkan di Blok A. Sila berundur segera.',
        priority: 'urgent',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        actions: [
          { label: language === 'en' ? 'Acknowledge' : 'Akui', action: () => {} },
          { label: language === 'en' ? 'Call Emergency' : 'Panggil Kecemasan', action: () => {} }
        ]
      },
      {
        id: '2',
        type: 'chat',
        title: language === 'en' ? 'New Message' : 'Mesej Baru',
        message: language === 'en' ? 'Sarah: The pool will be closed for maintenance tomorrow.' : 'Sarah: Kolam akan ditutup untuk penyelenggaraan esok.',
        priority: 'normal',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '3',
        type: 'announcement',
        title: language === 'en' ? 'Community Announcement' : 'Pengumuman Komuniti',
        message: language === 'en' ? 'Monthly community meeting scheduled for Saturday 3PM at the clubhouse.' : 'Mesyuarat komuniti bulanan dijadualkan pada Sabtu 3 petang di rumah kelab.',
        priority: 'normal',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: '4',
        type: 'call',
        title: language === 'en' ? 'Missed Call' : 'Panggilan Terlepas',
        message: language === 'en' ? 'You missed a video call from Ahmad Rahman.' : 'Anda terlepas panggilan video dari Ahmad Rahman.',
        priority: 'high',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        read: false,
        actions: [
          { label: language === 'en' ? 'Call Back' : 'Panggil Balik', action: () => {} }
        ]
      }
    ];

    setNotifications(mockNotifications);
  }, [language]);

  const updatePreference = (id: string, field: keyof NotificationPreference, value: any) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, [field]: value } : pref
      )
    );
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

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'announcement': return <Bell className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return language === 'en' ? 'Just now' : 'Baru sahaja';
    if (diffMins < 60) return language === 'en' ? `${diffMins}m ago` : `${diffMins}m lalu`;
    if (diffHours < 24) return language === 'en' ? `${diffHours}h ago` : `${diffHours}j lalu`;
    return language === 'en' ? `${diffDays}d ago` : `${diffDays}h lalu`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Notification Settings Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {language === 'en' ? 'Smart Notifications' : 'Notifikasi Pintar'}
            </div>
            <Badge variant="secondary">
              {unreadCount} {language === 'en' ? 'unread' : 'belum dibaca'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Global Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {doNotDisturb ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                <Label>{language === 'en' ? 'Do Not Disturb' : 'Jangan Ganggu'}</Label>
              </div>
              <Switch checked={doNotDisturb} onCheckedChange={setDoNotDisturb} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <Label>{language === 'en' ? 'Quiet Hours' : 'Waktu Senyap'}</Label>
              </div>
              <Switch 
                checked={quietHours.enabled} 
                onCheckedChange={(checked) => setQuietHours(prev => ({ ...prev, enabled: checked }))} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <Label>{language === 'en' ? 'Smart Filtering' : 'Penapisan Pintar'}</Label>
              </div>
              <Switch checked={smartFiltering} onCheckedChange={setSmartFiltering} />
            </div>
          </div>

          <Separator />

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              {language === 'en' ? 'Notification Types' : 'Jenis Notifikasi'}
            </h3>
            
            {preferences.map((pref) => (
              <Card key={pref.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(pref.type)}
                    <div>
                      <h4 className="font-medium">{pref.label}</h4>
                      <p className="text-sm text-muted-foreground">{pref.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={getPriorityColor(pref.priority)}>
                      {pref.priority.charAt(0).toUpperCase() + pref.priority.slice(1)}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      {pref.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <Switch 
                        checked={pref.sound} 
                        onCheckedChange={(checked) => updatePreference(pref.id, 'sound', checked)} 
                      />
                    </div>
                    
                    <Switch 
                      checked={pref.enabled} 
                      onCheckedChange={(checked) => updatePreference(pref.id, 'enabled', checked)} 
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {language === 'en' ? 'Recent Notifications' : 'Notifikasi Terkini'}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  {language === 'en' ? 'Mark All Read' : 'Tanda Semua Dibaca'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                {language === 'en' ? 'Clear All' : 'Kosongkan Semua'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'No notifications' : 'Tiada notifikasi'}
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getTypeIcon(notification.type)}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                    <Badge className={getPriorityColor(notification.priority)}>
                      {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                    </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            
                            {notification.actions && (
                              <div className="flex gap-2">
                                {notification.actions.map((action, index) => (
                                  <Button 
                                    key={index}
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.action();
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}