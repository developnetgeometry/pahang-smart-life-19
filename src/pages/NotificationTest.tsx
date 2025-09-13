import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { NotificationDebugDashboard } from '@/components/notifications/NotificationDebugDashboard';
import { FCMIntegrationVerifier } from '@/components/notifications/FCMIntegrationVerifier';
import { AdminNotificationTools } from '@/components/notifications/AdminNotificationTools';
import { RealTimeNotificationMonitor } from '@/components/notifications/RealTimeNotificationMonitor';
import { NotificationTest as LiveNotificationTest } from '@/components/communication/NotificationTest';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { Bell, TestTube, Settings, Users, Activity } from 'lucide-react';

export default function NotificationTest() {
  const { user, language } = useAuth();
  const {
    isInitialized,
    isSupported,
    permissionStatus,
    isSubscribed,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = useNotificationIntegration();

  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const runFullTest = async () => {
    const results: Record<string, any> = {};
    
    try {
      // Test 1: Check initialization
      results.initialization = {
        status: isInitialized ? 'pass' : 'fail',
        message: isInitialized ? 'Service initialized' : 'Service not initialized'
      };

      // Test 2: Check browser support
      results.browserSupport = {
        status: isSupported ? 'pass' : 'fail',
        message: isSupported ? 'Browser supports notifications' : 'Browser does not support notifications'
      };

      // Test 3: Check permission
      results.permission = {
        status: permissionStatus === 'granted' ? 'pass' : 'warning',
        message: permissionStatus === 'granted' ? 'Permission granted' : 'Permission not granted'
      };

      // Test 4: Check subscription
      results.subscription = {
        status: isSubscribed ? 'pass' : 'warning',
        message: isSubscribed ? 'User is subscribed' : 'User is not subscribed'
      };

      // Test 5: Send test notification
      if (isSubscribed) {
        const testSent = await sendTestNotification();
        results.testNotification = {
          status: testSent ? 'pass' : 'fail',
          message: testSent ? 'Test notification sent successfully' : 'Failed to send test notification'
        };
      }

      setTestResults(results);
    } catch (err) {
      console.error('Test suite error:', err);
      results.error = {
        status: 'fail',
        message: `Test suite error: ${err}`
      };
      setTestResults(results);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'fail': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TestTube className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'en' ? 'Notification System Test Suite' : 'Suite Ujian Sistem Notifikasi'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Comprehensive testing and verification of FCM push notifications'
              : 'Ujian dan pengesahan komprehensif bagi notifikasi tolak FCM'
            }
          </p>
        </div>
      </div>

      {/* Quick Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {language === 'en' ? 'System Status' : 'Status Sistem'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {language === 'en' ? 'Initialized' : 'Diinisialisasi'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {language === 'en' ? 'Supported' : 'Disokong'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissionStatus === 'granted' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm">
                {language === 'en' ? 'Permission' : 'Kebenaran'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm">
                {language === 'en' ? 'Subscribed' : 'Dilanggan'}
              </span>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={runFullTest} className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              {language === 'en' ? 'Run Full Test Suite' : 'Jalankan Suite Ujian Penuh'}
            </Button>
            {permissionStatus !== 'granted' && (
              <Button onClick={requestPermission} variant="outline">
                {language === 'en' ? 'Request Permission' : 'Minta Kebenaran'}
              </Button>
            )}
            {permissionStatus === 'granted' && !isSubscribed && (
              <Button onClick={subscribe} variant="outline">
                {language === 'en' ? 'Subscribe' : 'Langgan'}
              </Button>
            )}
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">
                {language === 'en' ? 'Test Results:' : 'Keputusan Ujian:'}
              </h4>
              {Object.entries(testResults).map(([key, result]: [string, any]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                  <span className="text-sm font-medium">{key}</span>
                  <span className="text-sm text-muted-foreground">{result.message}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="debug" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {language === 'en' ? 'Debug' : 'Nyahpepijat'}
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            {language === 'en' ? 'Verify' : 'Sahkan'}
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {language === 'en' ? 'Admin' : 'Admin'}
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {language === 'en' ? 'Monitor' : 'Pantau'}
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {language === 'en' ? 'Live Test' : 'Ujian Langsung'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debug">
          <NotificationDebugDashboard />
        </TabsContent>

        <TabsContent value="verification">
          <FCMIntegrationVerifier />
        </TabsContent>

        <TabsContent value="admin">
          <AdminNotificationTools />
        </TabsContent>

        <TabsContent value="monitor">
          <RealTimeNotificationMonitor />
        </TabsContent>

        <TabsContent value="live">
          <LiveNotificationTest />
        </TabsContent>
      </Tabs>
    </div>
  );
}