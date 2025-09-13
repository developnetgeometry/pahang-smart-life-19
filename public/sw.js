// Enhanced service worker for FCM push notifications and offline caching
const CACHE_NAME = 'pahang-smart-life-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/notification-test'
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Let the browser handle requests for scripts and assets from Supabase
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Handle push events for FCM
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'Pahang Smart Life',
    body: 'You have a new notification.',
    icon: '/lovable-uploads/8b5530a7-fe2b-4d5c-bcf6-5f679ad0e912.png',
    badge: '/lovable-uploads/8b5530a7-fe2b-4d5c-bcf6-5f679ad0e912.png',
    url: '/',
    data: {},
    actions: []
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Error parsing notification data:', error);
      notificationData.body = event.data.text();
    }
  }

  // Add contextual actions based on notification type
  const actions = [];
  if (notificationData.data?.notificationType) {
    switch (notificationData.data.notificationType) {
      case 'announcement':
        actions.push({ action: 'view_announcement', title: 'View' });
        break;
      case 'complaint':
        actions.push({ action: 'view_complaint', title: 'View Details' });
        break;
      case 'booking':
        actions.push({ action: 'view_booking', title: 'View Booking' });
        break;
      case 'emergency':
        actions.push({ action: 'acknowledge', title: 'Acknowledge' });
        break;
      default:
        actions.push({ action: 'open', title: 'Open App' });
    }
  } else {
    actions.push({ action: 'open', title: 'Open App' });
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: {
      url: notificationData.url,
      notificationType: notificationData.data?.notificationType,
      ...notificationData.data
    },
    actions: actions,
    requireInteraction: notificationData.data?.notificationType === 'emergency',
    silent: false,
    vibrate: notificationData.data?.notificationType === 'emergency' ? [200, 100, 200] : [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification click with improved routing
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  event.notification.close();

  let urlToOpen = event.notification.data.url || '/';
  
  // Handle specific actions
  if (event.action) {
    switch (event.action) {
      case 'view_announcement':
        urlToOpen = '/announcements';
        break;
      case 'view_complaint':
        urlToOpen = '/my-complaints';
        break;
      case 'view_booking':
        urlToOpen = '/my-bookings';
        break;
      case 'acknowledge':
        // Handle emergency acknowledgment
        urlToOpen = '/emergency';
        break;
      default:
        urlToOpen = event.notification.data.url || '/';
    }
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // If there's already a window open, focus it and navigate
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus().then(c => c.navigate(urlToOpen));
      }
      // Otherwise open a new window
      return clients.openWindow(urlToOpen);
    })
  );
});

// Handle notification close events for analytics
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  // Track notification dismissal for analytics
  if (event.notification.data?.notificationId) {
    // Could send analytics data here
    console.log('Notification dismissed:', event.notification.data.notificationId);
  }
});

// Handle background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);

  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  } else if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

// Background sync handler
async function handleBackgroundSync() {
  try {
    console.log('Performing background sync...');
    // Handle any background sync tasks here
    // For example, retry failed notification sends
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync notifications when coming back online
async function syncNotifications() {
  try {
    console.log('Syncing notifications...');
    const cache = await caches.open(CACHE_NAME);
    // Implementation for notification sync
  } catch (error) {
    console.error('Notification sync failed:', error);
  }
}

// Handle message events from the main thread
self.addEventListener('message', (event) => {
  console.log('SW received message:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CACHE_URLS':
        event.waitUntil(
          caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(event.data.urls);
          })
        );
        break;
    }
  }
});
