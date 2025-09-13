import React, { createContext, useContext, ReactNode } from 'react';
import { DeviceInfo, useDeviceInfo } from '@/hooks/use-mobile';

interface ViewContextType extends DeviceInfo {
  viewMode: 'mobile' | 'desktop';
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

interface ViewProviderProps {
  children: ReactNode;
}

export function ViewProvider({ children }: ViewProviderProps) {
  const deviceInfo = useDeviceInfo();

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