import { createContext, useContext, ReactNode } from 'react';
import { useDeviceInfo } from '@/hooks/use-mobile';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  width: number;
  viewMode: 'mobile' | 'desktop';
}

// Default device info for SSR
const DEFAULT_DEVICE_INFO: DeviceInfo = {
  width: 1024,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  deviceType: 'desktop',
  viewMode: 'desktop'
};

const DeviceContext = createContext<DeviceInfo>(DEFAULT_DEVICE_INFO);

interface DeviceProviderProps {
  children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
  const deviceInfo = useDeviceInfo();
  
  // Convert to our context format with viewMode
  const contextValue: DeviceInfo = {
    ...deviceInfo,
    viewMode: deviceInfo.isMobile ? 'mobile' : 'desktop'
  };

  return (
    <DeviceContext.Provider value={contextValue}>
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