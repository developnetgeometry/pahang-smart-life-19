import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { 
  Bug, 
  Database, 
  Key, 
  Server, 
  Smartphone, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';

interface DebugInfo {
  fcmConfig: {
    vapidKey: string | null;
    isValid: boolean;
  };
  serviceWorker: {
    registered: boolean;
    active: boolean;
    scope: string | null;
  };
  pushSubscription: {
    endpoint: string | null;
    keys: any;
    isActive: boolean;
  };
  databaseConnection: {
    connected: boolean;
    subscriptionExists: boolean;
    lastSync: string | null;
  };
  platform: {
    type: 'web' | 'ios' | 'android';
    userAgent: string;
    pushSupported: boolean;
  };
  recentLogs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    details?: any;
  }>;
}

export function NotificationDebugDashboard() {
  const { user, language } = useAuth();
  const { 
    isInitialized, 
    isSupported, 
    permissionStatus, 
    isSubscribed, 
    error,
    notificationService 
  } = useNotificationIntegration();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const collectDebugInfo = async () => {
    setIsLoading(true);
    try {
      const info: DebugInfo = {
        fcmConfig: {
          vapidKey: 'BJNnNfDo4Ek9g5gSFJd2xKY-qJOdIJJ2-dV3Ae7IUGWG4sWN1A8lKvYJ0qyQNdZRhGPZWQvVvTI3_JRGvI2YxjI',
          isValid: true
        },
        serviceWorker: {
          registered: false,
          active: false,
          scope: null
        },
        pushSubscription: {
          endpoint: null,
          keys: null,
          isActive: false
        },
        databaseConnection: {
          connected: false,
          subscriptionExists: false,
          lastSync: null
        },
        platform: {
          type: 'web',
          userAgent: navigator.userAgent,
          pushSupported: 'PushManager' in window && 'serviceWorker' in navigator
        },
        recentLogs: []
      };

      // Check service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          info.serviceWorker = {
            registered: true,
            active: !!registration.active,
            scope: registration.scope
          };

          // Check push subscription
          try {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              info.pushSubscription = {
                endpoint: subscription.endpoint,
                keys: subscription.toJSON().keys,
                isActive: true
              };
            }
          } catch (error) {
            console.error('Error getting push subscription:', error);
          }
        }
      }

      // Check database connection and subscription
      if (user?.id) {
        try {
          const { data: dbSubscription, error } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          info.databaseConnection = {
            connected: !error,
            subscriptionExists: !!dbSubscription,
            lastSync: dbSubscription?.updated_at || null
          };
        } catch (error) {
          console.error('Database check error:', error);
        }
      }

      // Detect platform
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('android')) {
        info.platform.type = 'android';
      } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        info.platform.type = 'ios';
      }

      // Mock recent logs (in a real implementation, these would come from a logging service)
      info.recentLogs = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Debug info collected',
          details: { userId: user?.id }
        }
      ];

      setDebugInfo(info);
    } catch (error) {
      console.error('Error collecting debug info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    collectDebugInfo();
  }, [user?.id]);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return status ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean | null, trueText: string, falseText: string, nullText?: string) => {
    if (status === null) {
      return <Badge variant="secondary">{nullText || 'Unknown'}</Badge>;
    }
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? trueText : falseText}
      </Badge>
    );
  };

  if (!debugInfo) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>{language === 'en' ? 'Collecting debug information...' : 'Mengumpul maklumat nyahpepijat...'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {language === 'en' ? 'Debug Dashboard' : 'Papan Pemuka Nyahpepijat'}
          </h2>
        </div>
        <Button 
          onClick={collectDebugInfo} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {language === 'en' ? 'Refresh' : 'Muat Semula'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FCM Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              {language === 'en' ? 'FCM Configuration' : 'Konfigurasi FCM'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">VAPID Key:</span>
              {getStatusIcon(debugInfo.fcmConfig.isValid)}
            </div>
            <div className="text-xs bg-muted p-2 rounded font-mono break-all">
              {debugInfo.fcmConfig.vapidKey || 'Not configured'}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Status:</span>
              {getStatusBadge(
                debugInfo.fcmConfig.isValid,
                language === 'en' ? 'Valid' : 'Sah',
                language === 'en' ? 'Invalid' : 'Tidak Sah'
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Worker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              {language === 'en' ? 'Service Worker' : 'Pekerja Perkhidmatan'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Registered:</span>
              {getStatusIcon(debugInfo.serviceWorker.registered)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active:</span>
              {getStatusIcon(debugInfo.serviceWorker.active)}
            </div>
            {debugInfo.serviceWorker.scope && (
              <div className="text-xs bg-muted p-2 rounded">
                <strong>Scope:</strong> {debugInfo.serviceWorker.scope}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Push Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'Push Subscription' : 'Langganan Tolak'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active:</span>
              {getStatusIcon(debugInfo.pushSubscription.isActive)}
            </div>
            {debugInfo.pushSubscription.endpoint && (
              <div className="text-xs bg-muted p-2 rounded break-all">
                <strong>Endpoint:</strong> {debugInfo.pushSubscription.endpoint}
              </div>
            )}
            {debugInfo.pushSubscription.keys && (
              <div className="text-xs bg-muted p-2 rounded">
                <strong>Keys:</strong> p256dh, auth configured
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              {language === 'en' ? 'Database' : 'Pangkalan Data'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Connected:</span>
              {getStatusIcon(debugInfo.databaseConnection.connected)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Subscription Exists:</span>
              {getStatusIcon(debugInfo.databaseConnection.subscriptionExists)}
            </div>
            {debugInfo.databaseConnection.lastSync && (
              <div className="text-xs text-muted-foreground">
                Last sync: {new Date(debugInfo.databaseConnection.lastSync).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            {language === 'en' ? 'Platform Information' : 'Maklumat Platform'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium">Platform:</span>
              <Badge variant="outline" className="ml-2">
                {debugInfo.platform.type.toUpperCase()}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Push Supported:</span>
              {getStatusIcon(debugInfo.platform.pushSupported)}
            </div>
            <div>
              <span className="text-sm font-medium">Integration Status:</span>
              {getStatusBadge(
                isInitialized && isSupported,
                language === 'en' ? 'Ready' : 'Sedia',
                language === 'en' ? 'Not Ready' : 'Tidak Sedia'
              )}
            </div>
          </div>
          <Separator />
          <div className="text-xs bg-muted p-2 rounded">
            <strong>User Agent:</strong> {debugInfo.platform.userAgent}
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Recent Activity' : 'Aktiviti Terkini'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {debugInfo.recentLogs.map((log, index) => (
                <div key={index} className="text-sm border-l-2 border-muted pl-3 py-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={log.level === 'error' ? 'destructive' : 
                              log.level === 'warn' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {log.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1">{log.message}</p>
                  {log.details && (
                    <pre className="text-xs bg-muted p-1 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              {debugInfo.recentLogs.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  {language === 'en' ? 'No recent activity' : 'Tiada aktiviti terkini'}
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}