import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from './Layout';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';

// Lazy load heavy dashboard components
const LazyResidentDashboard = React.lazy(() => 
  import('@/components/dashboard/ResidentDashboard').then(module => ({
    default: module.ResidentDashboard
  }))
);

const LazyStateAdminDashboard = React.lazy(() => 
  import('@/components/dashboard/StateAdminDashboard').then(module => ({
    default: module.StateAdminDashboard
  }))
);

const LazyDistrictCoordinatorDashboard = React.lazy(() => 
  import('@/components/dashboard/DistrictCoordinatorDashboard').then(module => ({
    default: module.DistrictCoordinatorDashboard
  }))
);

const LazyCommunityAdminDashboard = React.lazy(() => 
  import('@/components/dashboard/CommunityAdminDashboard').then(module => ({
    default: module.CommunityAdminDashboard
  }))
);

export function OptimizedLayout() {
  return (
    <Layout>
      <Suspense fallback={<DashboardSkeleton />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

export { 
  LazyResidentDashboard,
  LazyStateAdminDashboard, 
  LazyDistrictCoordinatorDashboard,
  LazyCommunityAdminDashboard
};