import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationSystem } from '@/hooks/use-notification-system';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  MessageSquare, 
  Phone, 
  Users, 
  AlertTriangle,
  Mail,
  Smartphone,
  Volume2,
  VolumeX,
  Check,
  Trash2
} from 'lucide-react';

interface NotificationSettings {
  messages: boolean;
  calls: boolean;
  announcements: boolean;
  emergencies: boolean;
  mentions: boolean;
  sound: boolean;
  email: boolean;
  push: boolean;
}

export default function NotificationCenter() {
  const { language } = useAuth();
  const { toast } = useToast();
  const { 
    notifications, 
    unreadCount, 
    preferences, 
    markAsRead, 
    markAllAsRead, 
    updatePreferences 
  } = useNotificationSystem();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    messages: true,
    calls: true,
    announcements: true,
    emergencies: true,
    mentions: true,
    sound: true,
    email: false,
    push: true
  });

  const updateSetting = async (key: keyof NotificationSettings) => {
    const newValue = !settings[key];
    setSettings(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Save to database via notification system hook
    try {
      await updatePreferences({ [key]: newValue });
      toast({
        title: language === 'en' ? 'Settings Updated' : 'Tetapan Dikemas Kini',
        description: language === 'en' ? 'Notification preferences saved' : 'Pilihan notifikasi disimpan',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revert on error
      setSettings(prev => ({
        ...prev,
        [key]: !newValue
      }));
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to save preferences' : 'Gagal menyimpan pilihan',
        variant: 'destructive',
      });
    }
  };

  const notificationTypes = [
    {
      key: 'messages' as keyof NotificationSettings,
      icon: MessageSquare,
      title: language === 'en' ? 'Chat Messages' : 'Mesej Chat',
      description: language === 'en' ? 'Get notified for new messages' : 'Dapatkan notifikasi untuk mesej baru',
      color: 'text-blue-600'
    },
    {
      key: 'calls' as keyof NotificationSettings,
      icon: Phone,
      title: language === 'en' ? 'Voice & Video Calls' : 'Panggilan Suara & Video',
      description: language === 'en' ? 'Incoming call notifications' : 'Notifikasi panggilan masuk',
      color: 'text-green-600'
    },
    {
      key: 'announcements' as keyof NotificationSettings,
      icon: Bell,
      title: language === 'en' ? 'Announcements' : 'Pengumuman',
      description: language === 'en' ? 'Community announcements and updates' : 'Pengumuman dan kemas kini komuniti',
      color: 'text-orange-600'
    },
    {
      key: 'emergencies' as keyof NotificationSettings,
      icon: AlertTriangle,
      title: language === 'en' ? 'Emergency Alerts' : 'Amaran Kecemasan',
      description: language === 'en' ? 'Critical safety notifications' : 'Notifikasi keselamatan kritikal',
      color: 'text-red-600'
    },
    {
      key: 'mentions' as keyof NotificationSettings,
      icon: Users,
      title: language === 'en' ? 'Mentions & Replies' : 'Sebutan & Balasan',
      description: language === 'en' ? 'When someone mentions or replies to you' : 'Apabila seseorang menyebut atau membalas anda',
      color: 'text-purple-600'
    }
  ];

  const deliveryMethods = [
    {
      key: 'sound' as keyof NotificationSettings,
      icon: Volume2,
      title: language === 'en' ? 'Sound Notifications' : 'Notifikasi Bunyi',
      description: language === 'en' ? 'Play sounds for notifications' : 'Mainkan bunyi untuk notifikasi'
    },
    {
      key: 'push' as keyof NotificationSettings,
      icon: Smartphone,
      title: language === 'en' ? 'Push Notifications' : 'Notifikasi Push',
      description: language === 'en' ? 'Browser push notifications' : 'Notifikasi push pelayar'
    },
    {
      key: 'email' as keyof NotificationSettings,
      icon: Mail,
      title: language === 'en' ? 'Email Notifications' : 'Notifikasi E-mel',
      description: language === 'en' ? 'Send notifications to email' : 'Hantar notifikasi ke e-mel'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            {language === 'en' ? 'Notification Types' : 'Jenis Notifikasi'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Choose what you want to be notified about'
              : 'Pilih perkara yang anda mahu diberitahu'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <IconComponent className={`w-5 h-5 ${type.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={type.key} className="font-medium">
                        {type.title}
                      </Label>
                      {type.key === 'emergencies' && (
                        <Badge variant="destructive" className="text-xs">
                          {language === 'en' ? 'Critical' : 'Kritikal'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={type.key}
                  checked={settings[type.key]}
                  onCheckedChange={() => updateSetting(type.key)}
                  disabled={type.key === 'emergencies'} // Emergency alerts always enabled
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            {language === 'en' ? 'Delivery Methods' : 'Kaedah Penghantaran'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'How you want to receive notifications'
              : 'Bagaimana anda mahu menerima notifikasi'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deliveryMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <div key={method.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor={method.key} className="font-medium">
                      {method.title}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={method.key}
                  checked={settings[method.key]}
                  onCheckedChange={() => updateSetting(method.key)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/30">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              {language === 'en' ? 'Recent Notifications' : 'Notifikasi Terkini'}
            </div>
            <Badge variant="secondary" className={`${unreadCount > 0 ? 'animate-pulse bg-gradient-to-r from-primary/20 to-secondary/20' : ''}`}>
              <span className="font-semibold">{unreadCount}</span>
              <span className="ml-1">{language === 'en' ? 'unread' : 'belum dibaca'}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'en' ? 'No notifications' : 'Tiada notifikasi'}
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 animate-fade-in hover-scale ${
                    !notification.is_read 
                      ? 'border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 shadow-sm hover:shadow-lg' 
                      : 'border-border/30 hover:border-border/50 bg-background/50 backdrop-blur-sm'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm text-foreground/90">{notification.title}</h4>
                        {!notification.is_read && (
                          <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse shadow-sm" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Mark All Read' : 'Tanda Semua Dibaca'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <Button variant="outline" className="flex-1">
          <VolumeX className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Mute All' : 'Bisukan Semua'}
        </Button>
        <Button className="flex-1" onClick={() => toast({ title: 'Settings saved successfully' })}>
          {language === 'en' ? 'Save Settings' : 'Simpan Tetapan'}
        </Button>
      </div>
    </div>
  );
}