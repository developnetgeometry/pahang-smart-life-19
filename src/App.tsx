import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ComplaintDetail from "./pages/ComplaintDetail";
import MyComplaints from "./pages/MyComplaints";
import MyProfile from "./pages/MyProfile";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Discussions from "./pages/Discussions";
import Marketplace from "./pages/Marketplace";
import MarketplaceItemDetail from "./pages/MarketplaceItemDetail";
import MyOrders from "./pages/MyOrders";
import Favorites from "./pages/Favorites";
import SellerDashboard from "./pages/SellerDashboard";
import ResidentAnalytics from "./pages/ResidentAnalytics";
import AdvertisementDetail from "./pages/AdvertisementDetail";
import AdvertisementManagement from "./pages/AdvertisementManagement";
import Services from "./pages/Services";
import MyListings from "./pages/MyListings";
import SellerProfile from "./pages/SellerProfile";
import CCTVLiveFeed from "./pages/CCTVLiveFeed";
import UserManagement from "./pages/admin/UserManagement";
import PermissionsManagement from "./pages/admin/PermissionsManagement";
import SecurityDashboard from "./pages/admin/SecurityDashboard";
import CommunityManagement from "./pages/admin/CommunityManagement";
import DistrictManagement from "./pages/admin/DistrictManagement";
import DistrictDetail from "./pages/admin/DistrictDetail";
import MaintenanceManagement from "./pages/admin/MaintenanceManagement";
import ComplaintsManagement from "./pages/admin/ComplaintsManagement";
import ComplaintsAnalytics from "./pages/admin/ComplaintsAnalytics";
import CCTVManagement from "./pages/admin/CCTVManagement";
import RequireRoles from "@/components/routing/RequireRoles";
import RequireNotRoles from "@/components/routing/RequireNotRoles";
import AuthOnlyRoute from "@/components/routing/AuthOnlyRoute";
import AnnouncementManagement from "./pages/admin/AnnouncementManagement";
import FacilitiesManagement from "./pages/admin/FacilitiesManagement";
import FloorPlanManagement from "./pages/admin/FloorPlanManagement";
import DiscussionManagement from "./pages/admin/DiscussionManagement";
import VisitorSecurity from "./pages/VisitorSecurity";
import VisitorAnalytics from "./pages/VisitorAnalytics";
import WorkOrdersManagement from "./pages/WorkOrdersManagement";
import MaintenanceAssets from "./pages/MaintenanceAssets";
import MaintenanceScheduler from "./pages/MaintenanceScheduler";
import MaintenanceReports from "./pages/MaintenanceReports";
import MaintenanceEmergency from "./pages/MaintenanceEmergency";
import CommunicationHub from "./pages/CommunicationHub";
import RoleManagement from "./pages/RoleManagement";
import NotificationSettings from "./pages/NotificationSettings";
import NotificationPage from "./pages/NotificationPage";
import PanicAlerts from "./pages/PanicAlerts";
import Directory from "./pages/Directory";
import ServiceProviderApplication from "./pages/ServiceProviderApplication";
import ServiceProviderManagement from "./pages/admin/ServiceProviderManagement";
import ServiceProviderReview from "./pages/admin/ServiceProviderReview";
import MyApplications from "./pages/MyApplications";
import NotFound from "./pages/NotFound";
// New Management Modules
import AssetManagement from "./pages/AssetManagement";
import ServiceRequests from "./pages/ServiceRequests";
import FinancialManagement from "./pages/FinancialManagement";
import InventoryManagement from "./pages/InventoryManagement";
import ModuleManagement from "./pages/admin/ModuleManagement";
import Facilities from "./pages/Facilities";
import MyBookings from "./pages/MyBookings";
import MyVisitors from "./pages/MyVisitors";
import VisitorApprovals from "./pages/VisitorApprovals";
import VisitorDashboard from "./pages/VisitorDashboard";
import ResidentDirectory from "./pages/ResidentDirectory";
import EnhancedEvents from "./pages/EnhancedEvents";
import ModerationPanel from "./components/discussions/ModerationPanel";
import PrecisionMapping from "./pages/PrecisionMapping";
import MaintenanceComplaintCenterPage from "./pages/MaintenanceComplaintCenter";
import PatrolInterfacePage from "./pages/PatrolInterface";
import FacilityComplaintCenterPage from "./pages/FacilityComplaintCenter";
import PendingApproval from "./pages/PendingApproval";
import CompleteAccount from "./pages/CompleteAccount";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing, isApproved, accountStatus } = useAuth();
  
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
  const { isAuthenticated, initializing, isApproved, accountStatus } = useAuth();
  
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/pending-approval"
              element={<PendingApproval />}
            />
            <Route
              path="/complete-account"
              element={
                <CompleteAccount />
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Index />
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
                      <MyComplaints />
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
                    <ComplaintDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-visitors"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyVisitors />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <AuthOnlyRoute>
                  <Layout>
                    <MyApplications />
                  </Layout>
                </AuthOnlyRoute>
              }
            />
            <Route
              path="/service-provider-application"
              element={
                <AuthOnlyRoute>
                  <Layout>
                    <ServiceProviderApplication />
                  </Layout>
                </AuthOnlyRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/role-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RoleManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotificationPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification-settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotificationSettings />
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
                      <Announcements />
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
                    <Events />
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
                      <Discussions />
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
                    <Marketplace />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/item/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MarketplaceItemDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyOrders />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Favorites />
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
                      <SellerDashboard />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Services />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-listings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyListings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/:sellerId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SellerProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace-analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ResidentAnalytics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/advertisement/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdvertisementDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/advertisements"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["service_provider"]}>
                    <Layout>
                      <AdvertisementManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/communication"
              element={<Navigate to="/communication-hub" replace />}
            />
            <Route
              path="/communication-hub"
              element={
                <ProtectedRoute>
                  <RequireNotRoles roles={["service_provider"]}>
                    <Layout>
                      <CommunicationHub />
                    </Layout>
                  </RequireNotRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/directory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Directory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-security"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VisitorSecurity />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-management"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "security_officer",
                      "community_admin",
                      "district_coordinator",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <VisitorApprovals />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-dashboard"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "security_officer",
                      "community_admin",
                      "district_coordinator",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <VisitorDashboard />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VisitorAnalytics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cctv-live"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CCTVManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cctv"
              element={<Navigate to="/cctv-live-feed" replace />}
            />

            {/* Professional view routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/permissions/:userId"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "community_admin",
                      "district_coordinator",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <PermissionsManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-providers"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "community_admin",
                      "district_coordinator",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <ServiceProviderManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-providers/review/:id"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "community_admin",
                      "district_coordinator",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <ServiceProviderReview />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/security"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SecurityDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/communities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CommunityManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/districts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DistrictManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/districts/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DistrictDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/facilities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FacilitiesManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/floor-plans"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "facility_manager",
                      "community_admin",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <FloorPlanManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/maintenance"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MaintenanceManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ComplaintsManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ComplaintsManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints-analytics"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "community_admin",
                      "district_coordinator",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <ComplaintsAnalytics />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cctv"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "security_officer",
                      "state_admin",
                      "community_admin",
                    ]}
                  >
                    <Layout>
                      <CCTVManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnnouncementManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcement-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnnouncementManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/discussions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DiscussionManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/modules"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["community_admin"]}>
                    <Layout>
                      <ModuleManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />

            {/* CCTV Management for residents */}
            <Route
              path="/cctv-live-feed"
              element={
                <ProtectedRoute>
                  <RequireNotRoles roles={["service_provider"]}>
                    <Layout>
                      <CCTVManagement />
                    </Layout>
                  </RequireNotRoles>
                </ProtectedRoute>
              }
            />

            {/* Security modules */}
            <Route
              path="/panic-alerts"
              element={
                <ProtectedRoute>
                  <RequireNotRoles roles={["service_provider"]}>
                    <Layout>
                      <PanicAlerts />
                    </Layout>
                  </RequireNotRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patrol-interface"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["security_officer"]}>
                    <Layout>
                      <PatrolInterfacePage />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />

            {/* Management modules */}
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <RequireNotRoles roles={["service_provider"]}>
                    <Layout>
                      <Facilities />
                    </Layout>
                  </RequireNotRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <RequireNotRoles roles={["service_provider"]}>
                    <Layout>
                      <MyBookings />
                    </Layout>
                  </RequireNotRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-requests"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asset-management"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "facility_manager",
                      "community_admin",
                      "district_coordinator",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <AssetManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/financial-management"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "community_admin",
                      "district_coordinator",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <FinancialManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory-management"
              element={
                <ProtectedRoute>
                  <RequireRoles
                    roles={[
                      "facility_manager",
                      "maintenance_staff",
                      "community_admin",
                      "district_coordinator",
                      "state_admin",
                    ]}
                  >
                    <Layout>
                      <InventoryManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/precision-mapping"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PrecisionMapping />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Maintenance Staff Routes */}
            <Route
              path="/facility-complaint-center"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["facility_manager"]}>
                    <Layout>
                      <FacilityComplaintCenterPage />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/work-orders-management"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["maintenance_staff"]}>
                    <Layout>
                      <WorkOrdersManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-complaint-center"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["maintenance_staff"]}>
                    <Layout>
                      <MaintenanceComplaintCenterPage />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-emergency"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["maintenance_staff"]}>
                    <Layout>
                      <MaintenanceEmergency />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-assets"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["maintenance_staff"]}>
                    <Layout>
                      <MaintenanceAssets />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-scheduler"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["maintenance_staff"]}>
                    <Layout>
                      <MaintenanceScheduler />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance-reports"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["maintenance_staff"]}>
                    <Layout>
                      <MaintenanceReports />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={<Navigate to="/maintenance-reports" replace />}
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
