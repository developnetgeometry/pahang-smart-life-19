import React, { createContext, useContext, ReactNode } from 'react';
import { DeviceInfo } from '@/hooks/use-mobile';

interface ViewContextType extends DeviceInfo {
  viewMode: 'mobile' | 'desktop';
}

// Static context value - no React hooks needed
const getStaticDeviceInfo = (): ViewContextType => {
  const width = typeof window !== "undefined" ? window.innerWidth : 1024;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    viewMode: isMobile ? 'mobile' : 'desktop'
  };
};

const ViewContext = createContext<ViewContextType>(getStaticDeviceInfo());

interface ViewProviderProps {
  children: ReactNode;
}

export function ViewProvider({ children }: ViewProviderProps) {
  // Provide static device info without using React hooks
  const staticContextValue = getStaticDeviceInfo();

  return (
    <ViewContext.Provider value={staticContextValue}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  return context;
}