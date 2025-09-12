import React, { useEffect } from 'react';

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ children }) => {
  useEffect(() => {
    // Monitor Core Web Vitals in development
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Log performance metrics
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('🚀 Navigation Timing:', {
              'DNS Lookup': navEntry.domainLookupEnd - navEntry.domainLookupStart,
              'TCP Connection': navEntry.connectEnd - navEntry.connectStart,
              'Server Response': navEntry.responseEnd - navEntry.requestStart,
              'DOM Processing': navEntry.domContentLoadedEventEnd - navEntry.responseEnd,
              'Total Load Time': navEntry.loadEventEnd - navEntry.fetchStart,
            });
          }
          
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('🎯 LCP:', entry.startTime, 'ms');
          }
          
          if (entry.entryType === 'first-input') {
            console.log('⚡ FID:', (entry as any).processingStart - entry.startTime, 'ms');
          }
          
          if (entry.entryType === 'layout-shift') {
            console.log('📐 CLS:', (entry as any).value);
          }
        });
      });

      // Observe different performance entry types
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input', 'layout-shift'] });

      return () => observer.disconnect();
    }
  }, []);

  // Memory usage monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemoryUsage = () => {
        const memory = (performance as any).memory;
        console.log('💾 Memory Usage:', {
          'Used JS Heap': Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          'Total JS Heap': Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          'Heap Limit': Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
        });
      };

      const interval = setInterval(logMemoryUsage, 30000); // Log every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  return <>{children}</>;
};

export default PerformanceMonitor;