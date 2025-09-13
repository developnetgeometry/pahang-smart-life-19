import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw,
  Shield,
  Database,
  Smartphone,
  Bell
} from 'lucide-react';

interface VerificationTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  result?: string;
  details?: any;
}

export function FCMIntegrationVerifier() {
  const { user, language } = useAuth();
  const {
    isInitialized,
    isSupported,
    hasPermission,
    isSubscribed,
    requestPermission,
    subscribe,
    sendTestNotification
  } = useNotificationIntegration();

  const [tests, setTests] = useState<VerificationTest[]>([
    {
      id: 'browser-support',
      name: language === 'en' ? 'Browser Support' : 'Sokongan Pelayar',
      description: language === 'en' 
        ? 'Verify browser supports push notifications and service workers'
        : 'Sahkan pelayar menyokong notifikasi tolak dan pekerja perkhidmatan',
      status: 'pending'
    },
    {
      id: 'vapid-key',
      name: language === 'en' ? 'VAPID Key Configuration' : 'Konfigurasi Kunci VAPID',
      description: language === 'en'
        ? 'Verify FCM VAPID public key is correctly configured'
        : 'Sahkan kunci awam VAPID FCM dikonfigurasi dengan betul',
      status: 'pending'
    },
    {
      id: 'service-worker',
      name: language === 'en' ? 'Service Worker Registration' : 'Pendaftaran Pekerja Perkhidmatan',
      description: language === 'en'
        ? 'Verify service worker is registered and active'
        : 'Sahkan pekerja perkhidmatan berdaftar dan aktif',
      status: 'pending'
    },
    {
      id: 'permission',
      name: language === 'en' ? 'Notification Permission' : 'Kebenaran Notifikasi',
      description: language === 'en'
        ? 'Verify user has granted notification permissions'
        : 'Sahkan pengguna telah memberikan kebenaran notifikasi',
      status: 'pending'
    },
    {
      id: 'subscription',
      name: language === 'en' ? 'Push Subscription' : 'Langganan Tolak',
      description: language === 'en'
        ? 'Verify push subscription is active and stored'
        : 'Sahkan langganan tolak aktif dan disimpan',
      status: 'pending'
    },
    {
      id: 'database-storage',
      name: language === 'en' ? 'Database Storage' : 'Penyimpanan Pangkalan Data',
      description: language === 'en'
        ? 'Verify subscription is properly stored in database'
        : 'Sahkan langganan disimpan dengan betul dalam pangkalan data',
      status: 'pending'
    },
    {
      id: 'firebase-config',
      name: language === 'en' ? 'Firebase Configuration' : 'Konfigurasi Firebase',
      description: language === 'en'
        ? 'Verify Firebase service account and FCM setup'
        : 'Sahkan akaun perkhidmatan Firebase dan persediaan FCM',
      status: 'pending'
    },
    {
      id: 'end-to-end',
      name: language === 'en' ? 'End-to-End Test' : 'Ujian Hujung ke Hujung',
      description: language === 'en'
        ? 'Send and receive a test notification'
        : 'Hantar dan terima notifikasi ujian',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const updateTestStatus = (testId: string, status: VerificationTest['status'], result?: string, details?: any) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, result, details }
        : test
    ));
  };

  const runTest = async (test: VerificationTest): Promise<void> => {
    updateTestStatus(test.id, 'running');

    try {
      switch (test.id) {
        case 'browser-support':
          const supported = 'PushManager' in window && 'serviceWorker' in navigator && 'Notification' in window;
          updateTestStatus(test.id, supported ? 'passed' : 'failed', 
            supported 
              ? language === 'en' ? 'Browser fully supports push notifications' : 'Pelayar menyokong sepenuhnya notifikasi tolak'
              : language === 'en' ? 'Browser missing push notification support' : 'Pelayar tiada sokongan notifikasi tolak'
          );
          break;

        case 'vapid-key':
          const vapidKey = 'BJNnNfDo4Ek9g5gSFJd2xKY-qJOdIJJ2-dV3Ae7IUGWG4sWN1A8lKvYJ0qyQNdZRhGPZWQvVvTI3_JRGvI2YxjI';
          const isValidKey = vapidKey && vapidKey.length > 80;
          updateTestStatus(test.id, isValidKey ? 'passed' : 'failed',
            isValidKey 
              ? language === 'en' ? 'VAPID key is properly configured' : 'Kunci VAPID dikonfigurasi dengan betul'
              : language === 'en' ? 'VAPID key is missing or invalid' : 'Kunci VAPID hilang atau tidak sah',
            { vapidKey: vapidKey ? `${vapidKey.substring(0, 20)}...` : null }
          );
          break;

        case 'service-worker':
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            const isActive = registration?.active !== null;
            updateTestStatus(test.id, isActive ? 'passed' : 'failed',
              isActive 
                ? language === 'en' ? 'Service worker is registered and active' : 'Pekerja perkhidmatan berdaftar dan aktif'
                : language === 'en' ? 'Service worker is not active' : 'Pekerja perkhidmatan tidak aktif',
              { scope: registration?.scope, state: registration?.active?.state }
            );
          } catch (error) {
            updateTestStatus(test.id, 'failed', 
              language === 'en' ? 'Failed to check service worker' : 'Gagal memeriksa pekerja perkhidmatan',
              { error: error.message }
            );
          }
          break;

        case 'permission':
          const permission = Notification.permission;
          updateTestStatus(test.id, 
            permission === 'granted' ? 'passed' : permission === 'denied' ? 'failed' : 'warning',
            permission === 'granted' 
              ? language === 'en' ? 'Permission granted' : 'Kebenaran diberikan'
              : permission === 'denied'
              ? language === 'en' ? 'Permission denied' : 'Kebenaran ditolak'
              : language === 'en' ? 'Permission not requested yet' : 'Kebenaran belum diminta',
            { permission }
          );
          break;

        case 'subscription':
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            const subscription = await registration?.pushManager.getSubscription();
            updateTestStatus(test.id, subscription ? 'passed' : 'warning',
              subscription 
                ? language === 'en' ? 'Push subscription is active' : 'Langganan tolak aktif'
                : language === 'en' ? 'No active push subscription' : 'Tiada langganan tolak aktif',
              { 
                endpoint: subscription?.endpoint ? `${subscription.endpoint.substring(0, 50)}...` : null,
                hasKeys: !!subscription?.toJSON().keys
              }
            );
          } catch (error) {
            updateTestStatus(test.id, 'failed', 
              language === 'en' ? 'Failed to check subscription' : 'Gagal memeriksa langganan',
              { error: error.message }
            );
          }
          break;

        case 'database-storage':
          if (!user?.id) {
            updateTestStatus(test.id, 'failed', 
              language === 'en' ? 'User not authenticated' : 'Pengguna tidak disahkan'
            );
            break;
          }

          try {
            const { data, error } = await supabase
              .from('push_subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .eq('is_active', true);

            updateTestStatus(test.id, 
              !error && data && data.length > 0 ? 'passed' : 'warning',
              !error && data && data.length > 0
                ? language === 'en' ? 'Subscription stored in database' : 'Langganan disimpan dalam pangkalan data'
                : language === 'en' ? 'No subscription found in database' : 'Tiada langganan dijumpai dalam pangkalan data',
              { subscriptionCount: data?.length || 0 }
            );
          } catch (error) {
            updateTestStatus(test.id, 'failed', 
              language === 'en' ? 'Database connection failed' : 'Sambungan pangkalan data gagal',
              { error: error.message }
            );
          }
          break;

        case 'firebase-config':
          try {
            // Test the edge function to verify Firebase configuration
            const { data, error } = await supabase.functions.invoke('send-push-notification', {
              body: { 
                title: 'Configuration Test',
                body: 'Testing Firebase configuration',
                test: true
              }
            });

            updateTestStatus(test.id, 
              !error ? 'passed' : 'failed',
              !error 
                ? language === 'en' ? 'Firebase configuration is valid' : 'Konfigurasi Firebase sah'
                : language === 'en' ? 'Firebase configuration error' : 'Ralat konfigurasi Firebase',
              { response: data, error: error?.message }
            );
          } catch (error) {
            updateTestStatus(test.id, 'failed', 
              language === 'en' ? 'Failed to test Firebase config' : 'Gagal menguji konfigurasi Firebase',
              { error: error.message }
            );
          }
          break;

        case 'end-to-end':
          if (!isSubscribed) {
            updateTestStatus(test.id, 'warning', 
              language === 'en' ? 'User must be subscribed for end-to-end test' : 'Pengguna mesti dilanggan untuk ujian hujung ke hujung'
            );
            break;
          }

          try {
            const success = await sendTestNotification();
            updateTestStatus(test.id, success ? 'passed' : 'failed',
              success 
                ? language === 'en' ? 'Test notification sent successfully' : 'Notifikasi ujian berjaya dihantar'
                : language === 'en' ? 'Failed to send test notification' : 'Gagal menghantar notifikasi ujian'
            );
          } catch (error) {
            updateTestStatus(test.id, 'failed', 
              language === 'en' ? 'Test notification failed' : 'Notifikasi ujian gagal',
              { error: error.message }
            );
          }
          break;
      }
    } catch (error) {
      updateTestStatus(test.id, 'failed', `Test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setCurrentTestIndex(0);

    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, result: undefined, details: undefined })));

    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i);
      await runTest(tests[i]);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    setCurrentTestIndex(0);
  };

  const getStatusIcon = (status: VerificationTest['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusBadge = (status: VerificationTest['status']) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-500">Passed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'warning': return <Badge variant="secondary">Warning</Badge>;
      case 'running': return <Badge variant="outline">Running</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const totalTests = tests.length;
  const progress = (passedTests / totalTests) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {language === 'en' ? 'FCM Integration Verification' : 'Pengesahan Integrasi FCM'}
          </h2>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {language === 'en' ? 'Run All Tests' : 'Jalankan Semua Ujian'}
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {language === 'en' ? 'Verification Progress' : 'Kemajuan Pengesahan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {language === 'en' ? 'Tests Passed' : 'Ujian Lulus'}: {passedTests}/{totalTests}
              </span>
              <Badge variant="outline">{Math.round(progress)}%</Badge>
            </div>
            <Progress value={progress} className="w-full" />
            
            {isRunning && (
              <div className="text-sm text-muted-foreground">
                {language === 'en' ? 'Running' : 'Menjalankan'}: {tests[currentTestIndex]?.name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="space-y-4">
        {tests.map((test, index) => (
          <Card key={test.id} className={test.status === 'running' ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>

              {test.result && (
                <div className="mt-3 p-2 bg-muted rounded text-sm">
                  {test.result}
                </div>
              )}

              {test.details && (
                <details className="mt-3">
                  <summary className="text-sm font-medium cursor-pointer">
                    {language === 'en' ? 'View Details' : 'Lihat Butiran'}
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {!hasPermission && (
              <Button onClick={requestPermission} variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Request Permission' : 'Minta Kebenaran'}
              </Button>
            )}
            {hasPermission && !isSubscribed && (
              <Button onClick={subscribe} variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Subscribe' : 'Langgan'}
              </Button>
            )}
            {isSubscribed && (
              <Button onClick={sendTestNotification} variant="outline" size="sm">
                <Smartphone className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Send Test' : 'Hantar Ujian'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}