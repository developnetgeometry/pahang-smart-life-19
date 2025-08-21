import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  MessageSquare, 
  Phone, 
  Users, 
  AlertTriangle,
  Mail,
  Smartphone,
  Volume2,
  VolumeX
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

  const updateSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <Button variant="outline" className="flex-1">
          <VolumeX className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Mute All' : 'Bisukan Semua'}
        </Button>
        <Button className="flex-1">
          {language === 'en' ? 'Save Settings' : 'Simpan Tetapan'}
        </Button>
      </div>
    </div>
  );
}