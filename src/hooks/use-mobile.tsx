import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  deviceType: DeviceType
  width: number
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(() => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        width: 1024
      }
    }

    const width = window.innerWidth
    const isMobile = width < MOBILE_BREAKPOINT
    const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
    const isDesktop = width >= TABLET_BREAKPOINT

    return {
      isMobile,
      isTablet,
      isDesktop,
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      width
    }
  })

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const isMobile = width < MOBILE_BREAKPOINT
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
      const isDesktop = width >= TABLET_BREAKPOINT

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        width
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceInfo
}

// Backwards compatibility
export function useIsMobile() {
  const { isMobile } = useDeviceInfo()
  return isMobile
}
