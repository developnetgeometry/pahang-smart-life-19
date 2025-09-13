import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { NotificationService } from '@/utils/notificationService';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationContextType {
  notificationService: NotificationService;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    let mounted = true;

    const initializeNotifications = async () => {
      if (!isAuthenticated || !user) {
        console.log('User not authenticated, skipping notification initialization');
        return;
      }

      try {
        console.log('Initializing notifications for authenticated user...');
        const initialized = await notificationService.initialize();
        
        if (!mounted) return;

        if (initialized) {
          console.log('Notifications initialized successfully');
        } else {
          console.warn('Failed to initialize notifications');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    // Initialize notifications when user is authenticated
    if (isAuthenticated && user) {
      initializeNotifications();
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user, notificationService]);

  const contextValue: NotificationContextType = {
    notificationService,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}