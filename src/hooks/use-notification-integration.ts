import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { NotificationService } from '@/utils/notificationService';

export interface NotificationIntegrationState {
  isInitialized: boolean;
  isSupported: boolean;
  isNative: boolean;
  permissionStatus: NotificationPermission | 'granted' | 'denied';
  isSubscribed: boolean;
  error: string | null;
}

export function useNotificationIntegration() {
  const [state, setState] = useState<NotificationIntegrationState>({
    isInitialized: false,
    isSupported: false,
    isNative: false,
    permissionStatus: 'default',
    isSubscribed: false,
    error: null,
  });

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    let mounted = true;

    const initializeNotifications = async () => {
      try {
        const isNative = Capacitor.isNativePlatform();
        
        // Initialize the notification service
        const initialized = await notificationService.initialize();
        
        if (!mounted) return;

        if (!initialized) {
          setState(prev => ({
            ...prev,
            isInitialized: false,
            isSupported: false,
            error: 'Failed to initialize notification service'
          }));
          return;
        }

        // Check permission status
        const permission = await notificationService.requestPermission();
        
        // Check if user is already subscribed
        const subscribed = await notificationService.isSubscribed();

        if (!mounted) return;

        setState({
          isInitialized: true,
          isSupported: true,
          isNative,
          permissionStatus: permission,
          isSubscribed: subscribed,
          error: null,
        });
      } catch (error) {
        console.error('Error initializing notifications:', error);
        if (!mounted) return;
        
        setState(prev => ({
          ...prev,
          isInitialized: true,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }));
      }
    };

    initializeNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const permission = await notificationService.requestPermission();
      setState(prev => ({ ...prev, permissionStatus: permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to request permission'
      }));
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    try {
      const success = await notificationService.subscribe();
      setState(prev => ({ ...prev, isSubscribed: success }));
      return success;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to subscribe'
      }));
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const success = await notificationService.unsubscribe();
      setState(prev => ({ ...prev, isSubscribed: !success }));
      return success;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to unsubscribe'
      }));
      return false;
    }
  };

  const sendTestNotification = async (): Promise<boolean> => {
    try {
      return await notificationService.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to send test notification'
      }));
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    notificationService,
  };
}