import React, { Suspense, lazy, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { OptimizedAuthProvider, useOptimizedAuth } from './OptimizedAuthProvider';
import { createOptimizedQueryClient } from '@/components/performance/OptimizedQueryClient';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireRoles from '@/components/routing/RequireRoles';
import RequireNotRoles from '@/components/routing/RequireNotRoles';
import AuthOnlyRoute from '@/components/routing/AuthOnlyRoute';
import { Layout } from '@/components/layout/Layout';

// Lazy load all pages for optimal performance
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const ComplaintDetail = lazy(() => import("@/pages/ComplaintDetail"));
const MyComplaints = lazy(() => import("@/pages/MyComplaints"));
const MyProfile = lazy(() => import("@/pages/MyProfile"));
const Announcements = lazy(() => import("@/pages/Announcements"));
const Events = lazy(() => import("@/pages/Events"));
const Discussions = lazy(() => import("@/pages/Discussions"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const MarketplaceItemDetail = lazy(() => import("@/pages/MarketplaceItemDetail"));
const MyOrders = lazy(() => import("@/pages/MyOrders"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const SellerDashboard = lazy(() => import("@/pages/SellerDashboard"));
const ResidentAnalytics = lazy(() => import("@/pages/ResidentAnalytics"));
const AdvertisementDetail = lazy(() => import("@/pages/AdvertisementDetail"));
const AdvertisementManagement = lazy(() => import("@/pages/AdvertisementManagement"));
const Services = lazy(() => import("@/pages/Services"));
const MyListings = lazy(() => import("@/pages/MyListings"));
const SellerProfile = lazy(() => import("@/pages/SellerProfile"));
const CCTVLiveFeed = lazy(() => import("@/pages/CCTVLiveFeed"));
const CommunicationHub = lazy(() => import("@/pages/CommunicationHub"));
const RoleManagement = lazy(() => import("@/pages/RoleManagement"));
const NotificationSettings = lazy(() => import("@/pages/NotificationSettings"));
const NotificationPage = lazy(() => import("@/pages/NotificationPage"));
const PanicAlerts = lazy(() => import("@/pages/PanicAlerts"));
const Directory = lazy(() => import("@/pages/Directory"));
const ServiceProviderApplication = lazy(() => import("@/pages/ServiceProviderApplication"));
const MyApplications = lazy(() => import("@/pages/MyApplications"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AssetManagement = lazy(() => import("@/pages/AssetManagement"));
const ServiceRequests = lazy(() => import("@/pages/ServiceRequests"));
const FinancialManagement = lazy(() => import("@/pages/FinancialManagement"));
const InventoryManagement = lazy(() => import("@/pages/InventoryManagement"));
const Facilities = lazy(() => import("@/pages/Facilities"));
const MyBookings = lazy(() => import("@/pages/MyBookings"));
const MyVisitors = lazy(() => import("@/pages/MyVisitors"));
const VisitorApprovals = lazy(() => import("@/pages/VisitorApprovals"));
const VisitorDashboard = lazy(() => import("@/pages/VisitorDashboard"));
const ResidentDirectory = lazy(() => import("@/pages/ResidentDirectory"));
const EnhancedEvents = lazy(() => import("@/pages/EnhancedEvents"));
const PrecisionMapping = lazy(() => import("@/pages/PrecisionMapping"));
const MaintenanceComplaintCenterPage = lazy(() => import("@/pages/MaintenanceComplaintCenter"));
const PatrolInterfacePage = lazy(() => import("@/pages/PatrolInterface"));
const FacilityComplaintCenterPage = lazy(() => import("@/pages/FacilityComplaintCenter"));
const PendingApproval = lazy(() => import("@/pages/PendingApproval"));
const CompleteAccount = lazy(() => import("@/pages/CompleteAccount"));
const VisitorSecurity = lazy(() => import("@/pages/VisitorSecurity"));
const VisitorAnalytics = lazy(() => import("@/pages/VisitorAnalytics"));
const WorkOrdersManagement = lazy(() => import("@/pages/WorkOrdersManagement"));
const MaintenanceAssets = lazy(() => import("@/pages/MaintenanceAssets"));
const MaintenanceScheduler = lazy(() => import("@/pages/MaintenanceScheduler"));
const MaintenanceReports = lazy(() => import("@/pages/MaintenanceReports"));
const MaintenanceEmergency = lazy(() => import("@/pages/MaintenanceEmergency"));

// Admin pages
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const PermissionsManagement = lazy(() => import("@/pages/admin/PermissionsManagement"));
const SecurityDashboard = lazy(() => import("@/pages/admin/SecurityDashboard"));
const CommunityManagement = lazy(() => import("@/pages/admin/CommunityManagement"));
const DistrictManagement = lazy(() => import("@/pages/admin/DistrictManagement"));
const DistrictDetail = lazy(() => import("@/pages/admin/DistrictDetail"));
const MaintenanceManagement = lazy(() => import("@/pages/admin/MaintenanceManagement"));
const ComplaintsManagement = lazy(() => import("@/pages/admin/ComplaintsManagement"));
const ComplaintsAnalytics = lazy(() => import("@/pages/admin/ComplaintsAnalytics"));
const CCTVManagement = lazy(() => import("@/pages/admin/CCTVManagement"));
const FacilitiesManagement = lazy(() => import("@/pages/admin/FacilitiesManagement"));
const FloorPlanManagement = lazy(() => import("@/pages/admin/FloorPlanManagement"));
const ServiceProviderManagement = lazy(() => import("@/pages/admin/ServiceProviderManagement"));
const ServiceProviderReview = lazy(() => import("@/pages/admin/ServiceProviderReview"));
const ModuleManagement = lazy(() => import("@/pages/admin/ModuleManagement"));
const GuestManagement = lazy(() => import("@/pages/admin/GuestManagement"));

// Enhanced query client for better performance
// Create optimized QueryClient instance
const queryClient = createOptimizedQueryClient();

// Optimized loading component
const LoadingScreen = React.memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
));

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedAccountStatuses?: string[];
}
const LazyRoute = React.memo(({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<DashboardSkeleton />}>
    {children}
  </Suspense>
));

function ProtectedRoute({ children, allowedAccountStatuses = ['approved'] }: ProtectedRouteProps) {
  const { isAuthenticated, initializing, isApproved, accountStatus } = useOptimizedAuth();
  
  if (initializing) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAuthenticated && accountStatus === 'pending_completion') {
    return <Navigate to="/complete-account" replace />;
  }
  
  if (isAuthenticated && !isApproved && accountStatus !== 'pending_completion') {
    return <Navigate to="/pending-approval" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing, isApproved, accountStatus } = useOptimizedAuth();
  
  if (initializing) {
    return <>{children}</>;
  }
  
  if (isAuthenticated && isApproved) {
    return <Navigate to="/" replace />;
  }
  
  if (isAuthenticated && accountStatus === 'pending_completion') {
    return <Navigate to="/complete-account" replace />;
  }
  
  if (isAuthenticated && !isApproved && accountStatus !== 'pending_completion') {
    return <Navigate to="/pending-approval" replace />;
  }
  
  return <>{children}</>;
}

const OptimizedApp = () => {
  const memoizedQueryClient = useMemo(() => queryClient, []);

  return (
    <QueryClientProvider client={memoizedQueryClient}>
      <OptimizedAuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LazyRoute>
                    <Login />
                  </LazyRoute>
                </PublicRoute>
              }
            />
            <Route
              path="/pending-approval"
              element={
                <LazyRoute>
                  <PendingApproval />
                </LazyRoute>
              }
            />
            <Route
              path="/complete-account"
              element={
                <LazyRoute>
                  <CompleteAccount />
                </LazyRoute>
              }
            />
            <Route
              path="/login/complete-account"
              element={<Navigate to="/complete-account" replace />}
            />
            <Route
              path="/reset-password"
              element={
                <LazyRoute>
                  <ResetPassword />
                </LazyRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <Index />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Resident modules */}
            <Route
              path="/my-complaints"
              element={
                <ProtectedRoute>
                  <RequireNotRoles roles={["service_provider"]}>
                    <Layout>
                      <LazyRoute>
                        <MyComplaints />
                      </LazyRoute>
                    </Layout>
                  </RequireNotRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaint/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <ComplaintDetail />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-visitors"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MyVisitors />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <AuthOnlyRoute>
                  <Layout>
                    <LazyRoute>
                      <MyApplications />
                    </LazyRoute>
                  </Layout>
                </AuthOnlyRoute>
              }
            />
            <Route
              path="/service-provider-application"
              element={
                <AuthOnlyRoute>
                  <Layout>
                    <LazyRoute>
                      <ServiceProviderApplication />
                    </LazyRoute>
                  </Layout>
                </AuthOnlyRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MyProfile />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <NotificationPage />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification-settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <NotificationSettings />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute>
                  <RequireNotRoles roles={["service_provider"]}>
                    <Layout>
                      <LazyRoute>
                        <Announcements />
                      </LazyRoute>
                    </Layout>
                  </RequireNotRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <Events />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions"
              element={
                <ProtectedRoute>
                  <RequireNotRoles roles={["service_provider"]}>
                    <Layout>
                      <LazyRoute>
                        <Discussions />
                      </LazyRoute>
                    </Layout>
                  </RequireNotRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <Marketplace />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/marketplace/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MarketplaceItemDetail />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MyOrders />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <Favorites />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller-dashboard"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["service_provider"]}>
                    <Layout>
                      <LazyRoute>
                        <SellerDashboard />
                      </LazyRoute>
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/resident-analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <ResidentAnalytics />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/advertisement/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <AdvertisementDetail />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/advertisement-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <AdvertisementManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <Services />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-listings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MyListings />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller-profile/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <SellerProfile />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cctv-live-feed"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <CCTVLiveFeed />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/communication-hub"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <CommunicationHub />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/role-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <RoleManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/panic-alerts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <PanicAlerts />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/directory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <Directory />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <Facilities />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MyBookings />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-approvals"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <VisitorApprovals />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <VisitorDashboard />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/resident-directory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <ResidentDirectory />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enhanced-events"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <EnhancedEvents />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/precision-mapping"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <PrecisionMapping />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-complaint-center"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MaintenanceComplaintCenterPage />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patrol-interface"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <PatrolInterfacePage />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/facility-complaint-center"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <FacilityComplaintCenterPage />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-security"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <VisitorSecurity />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <VisitorAnalytics />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/work-orders-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <WorkOrdersManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-assets"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MaintenanceAssets />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-scheduler"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MaintenanceScheduler />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MaintenanceReports />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-emergency"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MaintenanceEmergency />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <UserManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <PermissionsManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/security-dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <SecurityDashboard />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/community-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <CommunityManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <DistrictManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <DistrictDetail />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/maintenance-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <MaintenanceManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <ComplaintsManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints-analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <ComplaintsAnalytics />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cctv-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <CCTVManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/facilities-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <FacilitiesManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/floor-plan-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <FloorPlanManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-provider-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <ServiceProviderManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-provider-review/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <ServiceProviderReview />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/module-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <ModuleManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/admin/guest-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LazyRoute>
                      <GuestManagement />
                    </LazyRoute>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route 
              path="*" 
              element={
                <LazyRoute>
                  <NotFound />
                </LazyRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      <Toaster />
      </OptimizedAuthProvider>
    </QueryClientProvider>
  );
};

export default OptimizedApp;
