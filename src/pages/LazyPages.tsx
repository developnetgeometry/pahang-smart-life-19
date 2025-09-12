import React from 'react';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

// Lazy load heavy pages for better initial performance
export const LazyMarketplace = React.lazy(() => 
  import('./Marketplace').then(module => ({
    default: module.default
  }))
);

export const LazyFacilities = React.lazy(() => 
  import('./Facilities').then(module => ({
    default: module.default
  }))
);

export const LazyEvents = React.lazy(() => 
  import('./Events').then(module => ({
    default: module.default
  }))
);

export const LazyCommunicationHub = React.lazy(() => 
  import('./CommunicationHub').then(module => ({
    default: module.default
  }))
);

export const LazyPrecisionMapping = React.lazy(() => 
  import('./PrecisionMapping').then(module => ({
    default: module.default
  }))
);

export const LazyServices = React.lazy(() => 
  import('./Services').then(module => ({
    default: module.default
  }))
);

export const LazyDirectory = React.lazy(() => 
  import('./Directory').then(module => ({
    default: module.default
  }))
);

// Wrapper component for consistent loading state
interface LazyPageWrapperProps {
  children: React.ReactNode;
}

export function LazyPageWrapper({ children }: LazyPageWrapperProps) {
  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
      {children}
    </React.Suspense>
  );
}