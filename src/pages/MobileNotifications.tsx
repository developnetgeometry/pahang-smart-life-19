import React from 'react';
import { ArrowLeft, Smartphone, Globe, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MobileNotificationSetup } from '@/components/notifications/MobileNotificationSetup';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { Link } from 'react-router-dom';

export default function MobileNotifications() {
  const { language } = useAuth();
  const { isNative } = useNotificationIntegration();

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'en' ? 'Notification Settings' : 'Pengaturan Notifikasi'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Configure push notifications for your device' 
              : 'Konfigurasi notifikasi push untuk perangkat Anda'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Platform Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>
                {language === 'en' ? 'Platform Information' : 'Informasi Platform'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isNative ? <Smartphone className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                <div>
                  <p className="font-medium">
                    {isNative 
                      ? (language === 'en' ? 'Native Mobile App' : 'Aplikasi Mobile Asli')
                      : (language === 'en' ? 'Web Browser' : 'Browser Web')
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isNative
                      ? (language === 'en' 
                          ? 'Running as a native mobile application with full push notification support'
                          : 'Berjalan sebagai aplikasi mobile asli dengan dukungan notifikasi push penuh'
                        )
                      : (language === 'en'
                          ? 'Running in web browser with web push notification support'
                          : 'Berjalan di browser web dengan dukungan notifikasi push web'
                        )
                    }
                  </p>
                </div>
              </div>
              <Badge variant={isNative ? 'default' : 'secondary'}>
                {isNative 
                  ? (language === 'en' ? 'Native' : 'Asli')
                  : (language === 'en' ? 'Web' : 'Web')
                }
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notification Setup */}
        <MobileNotificationSetup />

        {/* Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'en' ? 'About Push Notifications' : 'Tentang Notifikasi Push'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">
                {language === 'en' ? 'What are push notifications?' : 'Apa itu notifikasi push?'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'en'
                  ? 'Push notifications are messages sent to your device to keep you informed about important community updates, even when the app is not actively open.'
                  : 'Notifikasi push adalah pesan yang dikirim ke perangkat Anda untuk memberi tahu tentang pembaruan komunitas penting, bahkan ketika aplikasi tidak sedang terbuka.'
                }
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">
                {language === 'en' ? 'Types of notifications you may receive:' : 'Jenis notifikasi yang mungkin Anda terima:'}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• {language === 'en' ? 'Community announcements' : 'Pengumuman komunitas'}</li>
                <li>• {language === 'en' ? 'Facility booking confirmations' : 'Konfirmasi pemesanan fasilitas'}</li>
                <li>• {language === 'en' ? 'Maintenance updates' : 'Pembaruan pemeliharaan'}</li>
                <li>• {language === 'en' ? 'Emergency alerts' : 'Peringatan darurat'}</li>
                <li>• {language === 'en' ? 'Event reminders' : 'Pengingat acara'}</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">
                {language === 'en' ? 'Privacy & Control' : 'Privasi & Kontrol'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'en'
                  ? 'You can enable or disable notifications at any time. We respect your privacy and only send relevant community information.'
                  : 'Anda dapat mengaktifkan atau menonaktifkan notifikasi kapan saja. Kami menghormati privasi Anda dan hanya mengirim informasi komunitas yang relevan.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}