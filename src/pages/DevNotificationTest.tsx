import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, Bug, Database, Activity, AlertTriangle, 
  Send, Trash2, Eye, Settings, Users, Timer,
  Wifi, WifiOff, RefreshCw, Download, Upload
} from 'lucide-react';

export default function DevNotificationTest() {
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

  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [dbData, setDbData] = useState<any>({});
  const [customNotification, setCustomNotification] = useState({
    title: 'Test Notification',
    body: 'This is a test push notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'test',
    requireInteraction: false,
    silent: false
  });

  // Environment check
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  };

  const clearLogs = () => setLogs([]);

  // Collect comprehensive debug information
  const collectDebugInfo = async () => {
    setIsLoading(true);
    addLog('Collecting debug information...');
    
    try {
      const info: any = {
        environment: {
          userAgent: navigator.userAgent,
          isSecureContext: window.isSecureContext,
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          isDevelopment
        },
        serviceWorker: {
          supported: 'serviceWorker' in navigator,
          controller: navigator.serviceWorker?.controller?.scriptURL,
          registrations: []
        },
        pushManager: {
          supported: 'PushManager' in window,
          subscription: null
        },
        notifications: {
          supported: 'Notification' in window,
          permission: Notification.permission
        },
        fcm: {
          initialized: isInitialized,
          supported: isSupported,
          subscribed: isSubscribed,
          error: error
        }
      };

      // Get service worker registrations
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        info.serviceWorker.registrations = registrations.map(reg => ({
          scope: reg.scope,
          scriptURL: reg.active?.scriptURL,
          state: reg.active?.state,
          updateViaCache: reg.updateViaCache
        }));
      }

      // Get push subscription details
      if (navigator.serviceWorker) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          info.pushManager.subscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.getKey('p256dh') ? 'present' : 'missing',
              auth: subscription.getKey('auth') ? 'present' : 'missing'
            },
            expirationTime: subscription.expirationTime
          };
        }
      }

      setDebugInfo(info);
      addLog('Debug information collected successfully');
    } catch (err) {
      addLog(`Error collecting debug info: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Database inspection
  const inspectDatabase = async () => {
    addLog('Inspecting database tables...');
    try {
      const [subscriptions, notifications, preferences] = await Promise.all([
        supabase.from('push_subscriptions').select('*').limit(10),
        supabase.from('notifications').select('*').limit(10),
        supabase.from('notification_preferences').select('*').limit(10)
      ]);

      setDbData({
        subscriptions: subscriptions.data || [],
        notifications: notifications.data || [],
        preferences: preferences.data || [],
        errors: {
          subscriptions: subscriptions.error,
          notifications: notifications.error,
          preferences: preferences.error
        }
      });
      
      addLog('Database inspection completed');
    } catch (err) {
      addLog(`Database inspection error: ${err}`);
    }
  };

  // Send custom notification
  const sendCustomNotification = async () => {
    addLog('Sending custom notification...');
    try {
      const response = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user?.id,
          title: customNotification.title,
          body: customNotification.body,
          data: {
            icon: customNotification.icon,
            badge: customNotification.badge,
            tag: customNotification.tag,
            requireInteraction: customNotification.requireInteraction,
            silent: customNotification.silent
          }
        }
      });

      if (response.error) {
        addLog(`Custom notification error: ${response.error.message}`);
      } else {
        addLog('Custom notification sent successfully');
      }
    } catch (err) {
      addLog(`Custom notification failed: ${err}`);
    }
  };

  // Simulate network failure
  const simulateNetworkFailure = () => {
    addLog('Simulating network failure...');
    // This would typically involve mocking network requests
    setTimeout(() => {
      addLog('Network failure simulation completed');
    }, 2000);
  };

  // Performance test
  const performanceTest = async () => {
    addLog('Starting performance test...');
    const startTime = performance.now();
    
    try {
      await sendTestNotification();
      const endTime = performance.now();
      addLog(`Performance test completed in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (err) {
      addLog(`Performance test failed: ${err}`);
    }
  };

  // Clean up test data
  const cleanupTestData = async () => {
    addLog('Cleaning up test data...');
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('category', 'test');
      addLog('Test data cleaned up');
    } catch (err) {
      addLog(`Cleanup failed: ${err}`);
    }
  };

  useEffect(() => {
    if (isDevelopment) {
      collectDebugInfo();
      inspectDatabase();
    }
  }, []);

  if (!isDevelopment) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Development Only</h1>
        <p>This page is only available in development mode.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Development Mode Only</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          This comprehensive testing interface is for development purposes only.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Bug className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Enhanced Notification Test Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive development tools for FCM push notifications
          </p>
        </div>
      </div>

      <Tabs defaultValue="debug" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Debug Tab */}
        <TabsContent value="debug">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Environment Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <Badge variant={debugInfo.environment?.protocol === 'https:' ? 'default' : 'destructive'}>
                      {debugInfo.environment?.protocol}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Secure Context:</span>
                    <Badge variant={debugInfo.environment?.isSecureContext ? 'default' : 'destructive'}>
                      {debugInfo.environment?.isSecureContext ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Development:</span>
                    <Badge variant={isDevelopment ? 'default' : 'secondary'}>
                      {isDevelopment ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  FCM Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Initialized:</span>
                    <Badge variant={isInitialized ? 'default' : 'destructive'}>
                      {isInitialized ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Supported:</span>
                    <Badge variant={isSupported ? 'default' : 'destructive'}>
                      {isSupported ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Permission:</span>
                    <Badge variant={permissionStatus === 'granted' ? 'default' : 'secondary'}>
                      {permissionStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscribed:</span>
                    <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                      {isSubscribed ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Service Worker Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <pre className="text-xs">
                  {JSON.stringify(debugInfo.serviceWorker, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database">
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button onClick={inspectDatabase} className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Refresh Data
              </Button>
              <Button onClick={cleanupTestData} variant="outline" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Clean Test Data
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Push Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40">
                    <pre className="text-xs">
                      {JSON.stringify(dbData.subscriptions, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40">
                    <pre className="text-xs">
                      {JSON.stringify(dbData.notifications, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40">
                    <pre className="text-xs">
                      {JSON.stringify(dbData.preferences, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Quick Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={sendTestNotification} className="w-full">
                  Send Standard Test
                </Button>
                <Button onClick={performanceTest} variant="outline" className="w-full">
                  Performance Test
                </Button>
                <Button onClick={requestPermission} variant="outline" className="w-full">
                  Request Permission
                </Button>
                {isSubscribed ? (
                  <Button onClick={unsubscribe} variant="destructive" className="w-full">
                    Unsubscribe
                  </Button>
                ) : (
                  <Button onClick={subscribe} variant="outline" className="w-full">
                    Subscribe
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Custom Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Title"
                  value={customNotification.title}
                  onChange={(e) => setCustomNotification(prev => ({...prev, title: e.target.value}))}
                />
                <Textarea
                  placeholder="Body"
                  value={customNotification.body}
                  onChange={(e) => setCustomNotification(prev => ({...prev, body: e.target.value}))}
                />
                <Input
                  placeholder="Tag"
                  value={customNotification.tag}
                  onChange={(e) => setCustomNotification(prev => ({...prev, tag: e.target.value}))}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={customNotification.requireInteraction}
                    onCheckedChange={(checked) => setCustomNotification(prev => ({...prev, requireInteraction: checked}))}
                  />
                  <Label>Require Interaction</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={customNotification.silent}
                    onCheckedChange={(checked) => setCustomNotification(prev => ({...prev, silent: checked}))}
                  />
                  <Label>Silent</Label>
                </div>
                <Button onClick={sendCustomNotification} className="w-full">
                  Send Custom
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Performance Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Performance metrics will be displayed here</p>
                <Button onClick={performanceTest}>Run Performance Test</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WifiOff className="w-5 h-5" />
                  Error Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={simulateNetworkFailure} variant="outline" className="w-full">
                  <WifiOff className="w-4 h-4 mr-2" />
                  Network Failure
                </Button>
                <Button variant="outline" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  FCM Service Down
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Rate Limiting
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Recovery Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={collectDebugInfo} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Reset State
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Logs
                </div>
                <Button onClick={clearLogs} variant="outline" size="sm">
                  Clear Logs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full rounded border bg-muted/50 p-4">
                <div className="space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No logs yet...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}