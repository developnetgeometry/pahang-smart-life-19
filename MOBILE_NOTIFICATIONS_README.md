# Mobile Push Notifications Implementation

This guide explains the Capacitor-based mobile push notification system implemented in the Pahang Smart Life application.

## Overview

The notification system supports both web and native mobile platforms:

- **Web Platform**: Uses Web Push API with service workers
- **Native Mobile**: Uses Capacitor Push Notifications plugin for iOS and Android

## Features Implemented

### 1. Platform Detection
- Automatically detects if running in native mobile app or web browser
- Adapts notification API usage based on platform

### 2. Enhanced Notification Service
- **File**: `src/utils/notificationService.ts`
- Supports both web push and native mobile notifications
- Handles permission requests for both platforms
- Manages subscription lifecycle (subscribe/unsubscribe)

### 3. Notification Management Hook
- **File**: `src/hooks/use-notification-integration.ts`
- Provides reactive state for notification status
- Handles initialization and permission management
- Includes error handling and status tracking

### 4. Mobile Notifications Settings Page
- **Route**: `/mobile-notifications`
- **Component**: `src/pages/MobileNotifications.tsx`
- Comprehensive settings interface for managing notifications
- Platform-specific information and controls
- Test notification functionality

### 5. Notification Setup Components
- **NotificationPrompt**: Shows setup prompt on dashboard
- **MobileNotificationSetup**: Full setup interface with status indicators
- Includes permission status, subscription status, and controls

### 6. Context Integration
- **NotificationProvider**: Initializes notification service when user logs in
- Integrated into main App component for automatic initialization

## Database Changes

The `push_subscriptions` table has been enhanced with:
- `native_token` column for storing FCM/APNs tokens
- `platform` column for distinguishing between 'ios', 'android', and 'web'
- Additional indexes for improved performance

## Configuration Required

### 1. Capacitor Setup
Install and initialize Capacitor in your local development:

```bash
npm install
npx cap init
npx cap add ios
npx cap add android
```

### 2. Native Platform Configuration

#### For iOS (APNs):
1. Configure Apple Developer account
2. Set up APNs certificates
3. Add push notification capability in Xcode

#### For Android (FCM):
1. Set up Firebase project
2. Add google-services.json to android app
3. Configure FCM server key

### 3. VAPID Keys (Web Push)
The current implementation includes a placeholder VAPID public key. For production:
1. Generate proper VAPID keys
2. Configure in notification service
3. Set up corresponding private key in edge function

## Usage

### For Users
1. Navigate to `/mobile-notifications` page
2. Grant notification permissions when prompted
3. Subscribe to receive notifications
4. Test functionality with the test button

### For Developers
```typescript
// Get notification integration status
const { 
  isInitialized, 
  isSupported, 
  isNative, 
  isSubscribed,
  subscribe,
  unsubscribe 
} = useNotificationIntegration();

// Send notifications (admin/system)
const notificationService = NotificationService.getInstance();
await notificationService.sendNotification(title, message, options);
```

## Testing

### Web Platform
1. Open application in browser
2. Navigate to notification settings
3. Allow permissions when prompted
4. Test with test notification button

### Native Mobile
1. Build and deploy app to device/emulator:
   ```bash
   npm run build
   npx cap sync
   npx cap run ios    # or android
   ```
2. Allow notification permissions
3. Test functionality

## Security Considerations

1. **VAPID Keys**: Replace placeholder keys with proper generated keys
2. **FCM/APNs Keys**: Secure server-side key storage
3. **Permission Handling**: Graceful handling of denied permissions
4. **Error Handling**: Comprehensive error boundaries and fallbacks

## Production Deployment

1. Update VAPID keys in both client and server
2. Configure FCM server key for Android
3. Set up APNs certificates for iOS
4. Test end-to-end notification flow
5. Monitor delivery rates and handle failures

## Files Modified/Created

### Core Implementation
- `src/utils/notificationService.ts` - Enhanced with Capacitor support
- `src/hooks/use-notification-integration.ts` - Integration hook
- `src/contexts/NotificationContext.tsx` - Context provider

### UI Components
- `src/components/notifications/MobileNotificationSetup.tsx`
- `src/components/notifications/NotificationPrompt.tsx`
- `src/pages/MobileNotifications.tsx`

### Configuration
- `capacitor.config.ts` - Capacitor configuration
- Database migration for push_subscriptions table enhancements

### Dependencies Added
- @capacitor/core
- @capacitor/cli
- @capacitor/ios
- @capacitor/android
- @capacitor/push-notifications
- terser (build dependency)

## Next Steps

1. **Production VAPID Setup**: Generate and configure proper VAPID keys
2. **FCM Integration**: Set up Firebase Cloud Messaging for Android
3. **APNs Integration**: Configure Apple Push Notification service
4. **Rich Notifications**: Implement images, actions, and interactive notifications
5. **Analytics**: Track notification delivery and engagement rates
6. **Scheduling**: Add support for scheduled and recurring notifications

For more information about Capacitor mobile development, see: https://netgeometry.com/blogs/capacitor-mobile-development