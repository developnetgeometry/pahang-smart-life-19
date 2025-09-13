import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, Check, X, AlertTriangle, Smartphone, Globe } from 'lucide-react';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  announcements: boolean;
  complaints: boolean;
  bookings: boolean;
  marketplace: boolean;
  security: boolean;
  emergencies: boolean;
  events: boolean;
  maintenance: boolean;
  messages: boolean;
  mentions: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
}

export function NotificationSetup() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const {
    isInitialized,
    isSupported,
    isNative,
    permissionStatus,
    isSubscribed,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = useNotificationIntegration();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    announcements: true,
    complaints: true,
    bookings: true,
    marketplace: true,
    security: true,
    emergencies: true,
    events: true,
    maintenance: true,
    messages: true,
    mentions: true,
    push_enabled: true,
    email_enabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          announcements: data.announcements,
          complaints: data.complaints,
          bookings: data.bookings,
          marketplace: data.marketplace,
          security: data.security,
          emergencies: data.emergencies,
          events: data.events,
          maintenance: data.maintenance,
          messages: data.messages || true,
          mentions: data.mentions || true,
          push_enabled: data.push_enabled ?? true,
          email_enabled: data.email_enabled ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load notification preferences',
      });
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPreferences(newPreferences);
      toast({
        title: 'Settings Saved',
        description: 'Your notification preferences have been updated',
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save notification preferences',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        const subscribed = await subscribe();
        if (subscribed) {
          await savePreferences({ ...preferences, push_enabled: true });
          toast({
            title: 'Notifications Enabled',
            description: 'You will now receive push notifications',
          });
        }
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to enable notifications',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await unsubscribe();
      await savePreferences({ ...preferences, push_enabled: false });
      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications',
      });
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to disable notifications',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        toast({
          title: 'Test Notification Sent',
          description: 'Check your device for the test notification',
        });
      } else {
        throw new Error('Test notification failed');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send test notification',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? 'default' : 'destructive'} className="gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  if (!isSupported) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Push notifications are not supported on your device or browser.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isNative ? <Smartphone className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
            Notification Status
          </CardTitle>
          <CardDescription>
            Current status of your push notification setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getStatusBadge(isInitialized, 'Initialized')}
            {getStatusBadge(isSupported, 'Supported')}
            {getStatusBadge(permissionStatus === 'granted', 'Permission')}
            {getStatusBadge(isSubscribed, 'Subscribed')}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {!isSubscribed ? (
              <Button
                onClick={handleEnableNotifications}
                disabled={loading}
                className="gap-2"
              >
                <Bell className="w-4 h-4" />
                Enable Notifications
              </Button>
            ) : (
              <Button
                onClick={handleDisableNotifications}
                variant="outline"
                disabled={loading}
                className="gap-2"
              >
                <BellOff className="w-4 h-4" />
                Disable Notifications
              </Button>
            )}

            {isSubscribed && (
              <Button
                onClick={handleTestNotification}
                variant="outline"
                disabled={loading}
              >
                Send Test
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Announcements</h4>
                <p className="text-sm text-muted-foreground">
                  Community announcements and updates
                </p>
              </div>
              <Switch
                checked={preferences.announcements}
                onCheckedChange={(checked) =>
                  savePreferences({ ...preferences, announcements: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Complaints & Issues</h4>
                <p className="text-sm text-muted-foreground">
                  Updates on your complaints and issues
                </p>
              </div>
              <Switch
                checked={preferences.complaints}
                onCheckedChange={(checked) =>
                  savePreferences({ ...preferences, complaints: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Facility Bookings</h4>
                <p className="text-sm text-muted-foreground">
                  Booking confirmations and reminders
                </p>
              </div>
              <Switch
                checked={preferences.bookings}
                onCheckedChange={(checked) =>
                  savePreferences({ ...preferences, bookings: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Marketplace</h4>
                <p className="text-sm text-muted-foreground">
                  New listings and marketplace activity
                </p>
              </div>
              <Switch
                checked={preferences.marketplace}
                onCheckedChange={(checked) =>
                  savePreferences({ ...preferences, marketplace: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Security Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Security incidents and alerts
                </p>
              </div>
              <Switch
                checked={preferences.security}
                onCheckedChange={(checked) =>
                  savePreferences({ ...preferences, security: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Emergency Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Critical emergency notifications
                </p>
              </div>
              <Switch
                checked={preferences.emergencies}
                onCheckedChange={(checked) =>
                  savePreferences({ ...preferences, emergencies: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Community Events</h4>
                <p className="text-sm text-muted-foreground">
                  Event invitations and updates
                </p>
              </div>
              <Switch
                checked={preferences.events}
                onCheckedChange={(checked) =>
                  savePreferences({ ...preferences, events: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Maintenance Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Maintenance schedules and updates
                </p>
              </div>
              <Switch
                checked={preferences.maintenance}
                onCheckedChange={(checked) =>
                  savePreferences({ ...preferences, maintenance: checked })
                }
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}