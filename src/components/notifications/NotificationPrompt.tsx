import React from 'react';
import { Bell, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface NotificationPromptProps {
  onDismiss?: () => void;
}

export function NotificationPrompt({ onDismiss }: NotificationPromptProps) {
  const { language } = useAuth();
  const { 
    isInitialized, 
    isSupported, 
    isNative, 
    permissionStatus, 
    isSubscribed 
  } = useNotificationIntegration();

  // Don't show if not initialized, not supported, or already subscribed
  if (!isInitialized || !isSupported || isSubscribed || permissionStatus === 'denied') {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isNative ? <Smartphone className="h-5 w-5 text-primary" /> : <Bell className="h-5 w-5 text-primary" />}
            <CardTitle className="text-lg">
              {language === 'en' ? 'Enable Push Notifications' : 'Aktifkan Notifikasi Push'}
            </CardTitle>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          {language === 'en'
            ? 'Stay updated with important community announcements, facility bookings, and emergency alerts.'
            : 'Tetap terkini dengan pengumuman komunitas penting, pemesanan fasilitas, dan peringatan darurat.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex space-x-2">
          <Link to="/mobile-notifications" className="flex-1">
            <Button className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Set Up Notifications' : 'Atur Notifikasi'}
            </Button>
          </Link>
          {onDismiss && (
            <Button variant="outline" onClick={onDismiss}>
              {language === 'en' ? 'Later' : 'Nanti'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}