// Completely new static device context - no React hooks
import { createContext, useContext, ReactNode } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  width: number;
  viewMode: 'mobile' | 'desktop';
}

// Static device info - no dynamic detection to avoid hook issues
const STATIC_DEVICE_INFO: DeviceInfo = {
  width: 1024,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  deviceType: 'desktop',
  viewMode: 'desktop'
};

const DeviceContext = createContext<DeviceInfo>(STATIC_DEVICE_INFO);

interface DeviceProviderProps {
  children: ReactNode;
}

// Static provider with no hooks
export function DeviceProvider({ children }: DeviceProviderProps) {
  return (
    <DeviceContext.Provider value={STATIC_DEVICE_INFO}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}

// Legacy compatibility
export function useView() {
  return useContext(DeviceContext);
}