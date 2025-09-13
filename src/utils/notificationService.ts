import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationSchema, ActionPerformed, PushNotificationToken } from '@capacitor/push-notifications';

// Base64 URL encode function
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private nativeToken: string | null = null;
  private isNative: boolean = false;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize the service worker and push notifications
  async initialize(): Promise<boolean> {
    try {
      if (this.isNative) {
        return await this.initializeNative();
      } else {
        return await this.initializeWeb();
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  private async initializeNative(): Promise<boolean> {
    try {
      // Request permissions for native notifications
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();

        // Listen for registration token
        PushNotifications.addListener('registration', (token: PushNotificationToken) => {
          console.log('Push registration success, token: ' + token.value);
          this.nativeToken = token.value;
          this.saveNativeSubscription(token.value);
        });

        // Listen for push notifications received
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push notification received: ', notification);
        });

        // Listen for push notification action performed
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push notification action performed', notification);
          // Handle notification tap - navigate to URL if provided
          if (notification.notification.data?.url) {
            window.location.href = notification.notification.data.url;
          }
        });

        return true;
      } else {
        console.warn('Push notification permissions not granted');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize native notifications:', error);
      return false;
    }
  }

  private async initializeWeb(): Promise<boolean> {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers not supported');
        return false;
      }

      // Check if push messaging is supported
      if (!('PushManager' in window)) {
        console.warn('Push messaging not supported');
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      return true;
    } catch (error) {
      console.error('Failed to initialize web notifications:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission | 'granted' | 'denied'> {
    if (this.isNative) {
      const permStatus = await PushNotifications.requestPermissions();
      return permStatus.receive === 'granted' ? 'granted' : 'denied';
    } else {
      if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return 'denied';
      }

      if (Notification.permission === 'default') {
        return await Notification.requestPermission();
      }

      return Notification.permission;
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<boolean> {
    try {
      if (this.isNative) {
        return await this.subscribeNative();
      } else {
        return await this.subscribeWeb();
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  private async subscribeNative(): Promise<boolean> {
    try {
      // Check permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Register for push notifications (this will trigger the registration listener)
      await PushNotifications.register();
      return true;
    } catch (error) {
      console.error('Failed to subscribe to native notifications:', error);
      return false;
    }
  }

  private async subscribeWeb(): Promise<boolean> {
    try {
      if (!this.registration) {
        await this.initialize();
      }

      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      // Check permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Get VAPID public key from environment or use default FCM key
      const vapidPublicKey = import.meta.env.VITE_FCM_VAPID_PUBLIC_KEY || 'BO43yWvfoaDMhw0ipVuFyiNFGk9wuKbKFWw1t1DZPp5EOVNgbj69ZD1emAcYSxTvDk7ttJ9NOIBgRTqkl2wOp3Y';

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log('Push subscription created:', this.subscription);

      // Save subscription to Supabase
      await this.saveSubscription(this.subscription);

      return true;
    } catch (error) {
      console.error('Failed to subscribe to web notifications:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        await this.removeSubscription(this.subscription);
        this.subscription = null;
        console.log('Unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Check if user is subscribed
  async isSubscribed(): Promise<boolean> {
    try {
      if (this.isNative) {
        return !!this.nativeToken;
      } else {
        if (!this.registration) {
          return false;
        }

        this.subscription = await this.registration.pushManager.getSubscription();
        return !!this.subscription;
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  // Save subscription to Supabase
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const subscriptionData = subscription.toJSON();
      const keys = subscriptionData.keys;

      if (!keys || !keys.p256dh || !keys.auth) {
        throw new Error('Invalid subscription keys');
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh_key: keys.p256dh,
          auth_key: keys.auth,
          device_type: 'web',
          is_active: true,
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) {
        throw error;
      }

      console.log('Subscription saved to database');
    } catch (error) {
      console.error('Failed to save subscription:', error);
      throw error;
    }
  }

  // Save native subscription to Supabase
  private async saveNativeSubscription(token: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const platform = Capacitor.getPlatform();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: token,
          p256dh_key: null,
          auth_key: null,
          device_type: platform, // 'ios' or 'android'
          is_active: true,
          native_token: token
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) {
        throw error;
      }

      console.log('Native subscription saved to database');
    } catch (error) {
      console.error('Failed to save native subscription:', error);
      throw error;
    }
  }

  // Remove subscription from Supabase
  private async removeSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);

      if (error) {
        throw error;
      }

      console.log('Subscription removed from database');
    } catch (error) {
      console.error('Failed to remove subscription:', error);
      throw error;
    }
  }

  // Send a test notification
  async sendTestNotification(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: 'Test Notification',
          body: 'This is a test notification from Pahang Smart Life',
          url: '/',
          notificationType: 'test'
        }
      });

      if (error) {
        throw error;
      }

      console.log('Test notification sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  }

  // Get notification preferences
  async getPreferences(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {
        announcements: true,
        bookings: true,
        complaints: true,
        events: true,
        maintenance: true,
        security: true,
      };
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return null;
    }
  }

  // Update notification preferences
  async updatePreferences(preferences: any): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      console.log('Preferences updated');
      return true;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  }

  // Send a notification (admin only)
  async sendNotification(title: string, message: string, options?: {
    url?: string;
    notificationType?: string;
    userIds?: string[];
    districtId?: string;
  }): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title,
          body: message, // Edge function expects 'body' property
          url: options?.url,
          notificationType: options?.notificationType || 'general',
          userIds: options?.userIds,
          districtId: options?.districtId
        }
      });

      if (error) {
        throw error;
      }

      console.log('Notification sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }
}