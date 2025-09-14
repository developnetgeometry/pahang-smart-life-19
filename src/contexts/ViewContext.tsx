import React, { createContext, useContext, ReactNode } from 'react';
import { DeviceInfo } from '@/hooks/use-mobile';

interface ViewContextType extends DeviceInfo {
  viewMode: 'mobile' | 'desktop';
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

interface ViewProviderProps {
  children: ReactNode;
}

export function ViewProvider({ children }: ViewProviderProps) {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | null>(null);

  React.useEffect(() => {
    // Only initialize after component mounts
    try {
      const info = {
        width: typeof window !== "undefined" ? window.innerWidth : 1024,
        isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
        isTablet: typeof window !== "undefined" ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
        isDesktop: typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
        deviceType: (typeof window !== "undefined" ? 
          (window.innerWidth < 768 ? 'mobile' : 
           window.innerWidth < 1024 ? 'tablet' : 'desktop') : 'desktop') as DeviceInfo['deviceType']
      };
      setDeviceInfo(info);

      const handleResize = () => {
        const width = window.innerWidth;
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
        const isDesktop = width >= 1024;
        
        setDeviceInfo({
          width,
          isMobile,
          isTablet,
          isDesktop,
          deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
        });
      };

      if (typeof window !== "undefined") {
        window.addEventListener('resize', handleResize);
      }
      
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener('resize', handleResize);
        }
      };
    } catch (error) {
      console.error('ViewProvider initialization error:', error);
      // Set fallback device info on error
      setDeviceInfo({
        width: 1024,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop'
      });
    }
  }, []);

  // Return early with default values if deviceInfo is not ready yet
  if (!deviceInfo) {
    const defaultInfo: DeviceInfo = {
      width: 1024,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: 'desktop'
    };
    
    const defaultContextValue: ViewContextType = {
      ...defaultInfo,
      viewMode: 'desktop'
    };

    return (
      <ViewContext.Provider value={defaultContextValue}>
        {children}
      </ViewContext.Provider>
    );
  }

  const contextValue: ViewContextType = {
    ...deviceInfo,
    viewMode: deviceInfo.isMobile ? 'mobile' : 'desktop'
  };

  return (
    <ViewContext.Provider value={contextValue}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
}