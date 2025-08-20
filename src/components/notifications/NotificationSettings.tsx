import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, TestTube, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/utils/notificationService';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationSettings() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    announcements: true,
    bookings: true,
    complaints: true,
    events: true,
    maintenance: true,
    security: true,
  });

  const notificationService = NotificationService.getInstance();

  const text = {
    en: {
      title: 'Notification Settings',
      subtitle: 'Manage your push notification preferences',
      pushNotifications: 'Push Notifications',
      enable: 'Enable Notifications',
      disable: 'Disable Notifications',
      testNotification: 'Send Test',
      preferences: 'Notification Preferences',
      announcements: 'Announcements',
      bookings: 'Booking Updates',
      complaints: 'Complaint Status',
      events: 'Community Events',
      maintenance: 'Maintenance Alerts',
      security: 'Security Notifications',
      enabled: 'Enabled',
      disabled: 'Disabled',
      loading: 'Loading...',
      enabledSuccess: 'Notifications enabled successfully!',
      disabledSuccess: 'Notifications disabled successfully!',
      testSent: 'Test notification sent!',
      permissionDenied: 'Notification permission denied',
      error: 'Failed to update notification settings',
      browserNotSupported: 'Push notifications are not supported in this browser',
      preferencesUpdated: 'Preferences updated successfully!'
    },
    ms: {
      title: 'Tetapan Notifikasi',
      subtitle: 'Urus keutamaan notifikasi tolak anda',
      pushNotifications: 'Notifikasi Tolak',
      enable: 'Aktifkan Notifikasi',
      disable: 'Nyahaktifkan Notifikasi',
      testNotification: 'Hantar Ujian',
      preferences: 'Keutamaan Notifikasi',
      announcements: 'Pengumuman',
      bookings: 'Kemas Kini Tempahan',
      complaints: 'Status Aduan',
      events: 'Acara Komuniti',
      maintenance: 'Amaran Penyelenggaraan',
      security: 'Notifikasi Keselamatan',
      enabled: 'Diaktifkan',
      disabled: 'Dinyahaktifkan',
      loading: 'Memuatkan...',
      enabledSuccess: 'Notifikasi berjaya diaktifkan!',
      disabledSuccess: 'Notifikasi berjaya dinyahaktifkan!',
      testSent: 'Notifikasi ujian dihantar!',
      permissionDenied: 'Kebenaran notifikasi ditolak',
      error: 'Gagal mengemas kini tetapan notifikasi',
      browserNotSupported: 'Notifikasi tolak tidak disokong dalam pelayar ini',
      preferencesUpdated: 'Keutamaan berjaya dikemas kini!'
    }
  };

  const t = text[language];

  useEffect(() => {
    checkNotificationStatus();
    loadPreferences();
  }, []);

  const checkNotificationStatus = async () => {
    setIsLoading(true);
    try {
      await notificationService.initialize();
      const subscribed = await notificationService.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking notification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        const success = await notificationService.unsubscribe();
        if (success) {
          setIsSubscribed(false);
          toast({
            title: t.disabledSuccess,
          });
        } else {
          throw new Error('Failed to unsubscribe');
        }
      } else {
        const success = await notificationService.subscribe();
        if (success) {
          setIsSubscribed(true);
          toast({
            title: t.enabledSuccess,
          });
        } else {
          throw new Error('Failed to subscribe');
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      let errorMessage = t.error;
      
      if (error.message.includes('permission')) {
        errorMessage = t.permissionDenied;
      } else if (error.message.includes('not supported')) {
        errorMessage = t.browserNotSupported;
      }
      
      toast({
        title: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    try {
      const success = await notificationService.sendTestNotification();
      if (success) {
        toast({
          title: t.testSent,
        });
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: t.error,
        variant: 'destructive',
      });
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const success = await notificationService.updatePreferences(newPreferences);
      if (success) {
        toast({
          title: t.preferencesUpdated,
        });
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revert the change on error
      setPreferences(preferences);
      toast({
        title: t.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Push Notifications Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            {t.pushNotifications}
          </CardTitle>
          <CardDescription>
            {isSubscribed ? (
              <Badge variant="default">{t.enabled}</Badge>
            ) : (
              <Badge variant="secondary">{t.disabled}</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                {isSubscribed ? t.disable : t.enable}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {isSubscribed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendTest}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {t.testNotification}
                </Button>
              )}
              <Button
                onClick={handleToggleNotifications}
                disabled={isLoading}
                variant={isSubscribed ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isSubscribed ? (
                  <BellOff className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                {isLoading ? t.loading : (isSubscribed ? t.disable : t.enable)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {isSubscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t.preferences}
            </CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries({
              announcements: t.announcements,
              bookings: t.bookings,
              complaints: t.complaints,
              events: t.events,
              maintenance: t.maintenance,
              security: t.security,
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-base font-medium cursor-pointer">
                  {label}
                </Label>
                <Switch
                  id={key}
                  checked={preferences[key as keyof typeof preferences]}
                  onCheckedChange={(checked) => handlePreferenceChange(key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}