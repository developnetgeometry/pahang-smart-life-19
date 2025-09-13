import React from 'react';
import { Bell, Smartphone, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function MobileNotificationSetup() {
  const { language } = useAuth();
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

  const handleEnableNotifications = async () => {
    try {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        const subscribed = await subscribe();
        if (subscribed) {
          toast({
            title: language === 'en' ? 'Notifications Enabled' : 'Notifikasi Diaktifkan',
            description: language === 'en' 
              ? 'You will now receive push notifications' 
              : 'Anda akan menerima notifikasi push',
          });
        } else {
          toast({
            title: language === 'en' ? 'Subscription Failed' : 'Langganan Gagal',
            description: language === 'en' 
              ? 'Failed to subscribe to notifications' 
              : 'Gagal berlangganan notifikasi',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: language === 'en' ? 'Permission Required' : 'Izin Diperlukan',
          description: language === 'en' 
            ? 'Please allow notifications in your device settings' 
            : 'Harap izinkan notifikasi di pengaturan perangkat Anda',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      toast({
        title: language === 'en' ? 'Error' : 'Kesalahan',
        description: language === 'en' 
          ? 'Failed to enable notifications' 
          : 'Gagal mengaktifkan notifikasi',
        variant: 'destructive',
      });
    }
  };

  const handleDisableNotifications = async () => {
    const success = await unsubscribe();
    if (success) {
      toast({
        title: language === 'en' ? 'Notifications Disabled' : 'Notifikasi Dinonaktifkan',
        description: language === 'en' 
          ? 'You will no longer receive push notifications' 
          : 'Anda tidak akan lagi menerima notifikasi push',
      });
    }
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      toast({
        title: language === 'en' ? 'Test Sent' : 'Tes Dikirim',
        description: language === 'en' 
          ? 'Test notification sent successfully' 
          : 'Notifikasi tes berhasil dikirim',
      });
    } else {
      toast({
        title: language === 'en' ? 'Test Failed' : 'Tes Gagal',
        description: language === 'en' 
          ? 'Failed to send test notification' 
          : 'Gagal mengirim notifikasi tes',
        variant: 'destructive',
      });
    }
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              {language === 'en' ? 'Initializing notifications...' : 'Menginisialisasi notifikasi...'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <X className="h-5 w-5 text-destructive" />
            <span>{language === 'en' ? 'Notifications Not Supported' : 'Notifikasi Tidak Didukung'}</span>
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Your device or browser does not support push notifications' 
              : 'Perangkat atau browser Anda tidak mendukung notifikasi push'}
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isNative ? <Smartphone className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          <span>
            {language === 'en' ? 'Push Notifications' : 'Notifikasi Push'}
          </span>
          {isNative && (
            <Badge variant="secondary" className="ml-2">
              {language === 'en' ? 'Native' : 'Asli'}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {language === 'en' 
            ? 'Stay updated with real-time notifications from the community' 
            : 'Tetap terkini dengan notifikasi waktu nyata dari komunitas'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {language === 'en' ? 'Permission Status' : 'Status Izin'}
            </p>
            <div className="flex items-center space-x-2">
              {permissionStatus === 'granted' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm text-muted-foreground capitalize">
                {permissionStatus}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {language === 'en' ? 'Subscription Status' : 'Status Langganan'}
            </p>
            <div className="flex items-center space-x-2">
              {isSubscribed ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? (language === 'en' ? 'Active' : 'Aktif')
                  : (language === 'en' ? 'Inactive' : 'Tidak Aktif')
                }
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {!isSubscribed ? (
            <Button 
              onClick={handleEnableNotifications}
              className="flex-1"
              disabled={permissionStatus === 'denied'}
            >
              <Bell className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Enable Notifications' : 'Aktifkan Notifikasi'}
            </Button>
          ) : (
            <Button 
              onClick={handleDisableNotifications}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Disable Notifications' : 'Nonaktifkan Notifikasi'}
            </Button>
          )}
          
          {isSubscribed && (
            <Button 
              onClick={handleTestNotification}
              variant="outline"
            >
              {language === 'en' ? 'Test' : 'Tes'}
            </Button>
          )}
        </div>

        {permissionStatus === 'denied' && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            {language === 'en' 
              ? 'Notifications are blocked. Please enable them in your browser or device settings.' 
              : 'Notifikasi diblokir. Harap aktifkan di pengaturan browser atau perangkat Anda.'}
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}