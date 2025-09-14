import { createContext, useContext, ReactNode } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  width: number;
}

interface ViewContextType extends DeviceInfo {
  viewMode: 'mobile' | 'desktop';
}

// Default static values - no window access, no React hooks
const DEFAULT_DEVICE_INFO: ViewContextType = {
  width: 1024,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  deviceType: 'desktop',
  viewMode: 'desktop'
};

const ViewContext = createContext<ViewContextType>(DEFAULT_DEVICE_INFO);

interface ViewProviderProps {
  children: ReactNode;
}

export function ViewProvider({ children }: ViewProviderProps) {
  // Return completely static context without any React hooks or window access
  return (
    <ViewContext.Provider value={DEFAULT_DEVICE_INFO}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  return useContext(ViewContext);
}