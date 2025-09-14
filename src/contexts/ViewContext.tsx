// Completely new ViewContext - no React hooks at all
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

// Static fallback - no dynamic detection
const STATIC_DEVICE_INFO: ViewContextType = {
  width: 1024,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  deviceType: 'desktop',
  viewMode: 'desktop'
};

const ViewContext = createContext<ViewContextType>(STATIC_DEVICE_INFO);

interface ViewProviderProps {
  children: ReactNode;
}

// Static provider - no hooks, no window access
export function ViewProvider({ children }: ViewProviderProps) {
  return (
    <ViewContext.Provider value={STATIC_DEVICE_INFO}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  return useContext(ViewContext);
}