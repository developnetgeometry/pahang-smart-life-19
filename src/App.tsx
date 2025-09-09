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
import CCTVLiveFeed from "./pages/CCTVLiveFeed";
import UserManagement from "./pages/admin/UserManagement";
import PermissionsManagement from "./pages/admin/PermissionsManagement";
import SecurityDashboard from "./pages/admin/SecurityDashboard";
import CommunityManagement from "./pages/admin/CommunityManagement";
import DistrictManagement from "./pages/admin/DistrictManagement";
import MaintenanceManagement from "./pages/admin/MaintenanceManagement";
import ComplaintsManagement from "./pages/admin/ComplaintsManagement";
import ComplaintsAnalytics from "./pages/admin/ComplaintsAnalytics";
import CCTVManagement from "./pages/admin/CCTVManagement";
import RequireRoles from "@/components/routing/RequireRoles";
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
import RoleDiagnostics from "./pages/admin/RoleDiagnostics";
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
import ResidentDirectory from './pages/ResidentDirectory';
import EnhancedEvents from './pages/EnhancedEvents';
import ModerationPanel from './components/discussions/ModerationPanel';
import PrecisionMapping from "./pages/PrecisionMapping";
import MaintenanceComplaintCenterPage from "./pages/MaintenanceComplaintCenter";
import PatrolInterfacePage from "./pages/PatrolInterface";
import FacilityComplaintCenterPage from "./pages/FacilityComplaintCenter";
import ServiceProviders from "./pages/ServiceProviders";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
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
                  <Layout>
                    <MyComplaints />
                  </Layout>
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
                <ProtectedRoute>
                  <Layout>
                    <MyApplications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-provider-application"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceProviderApplication />
                  </Layout>
                </ProtectedRoute>
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
                  <Layout>
                    <Announcements />
                  </Layout>
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
                  <Layout>
                    <Discussions />
                  </Layout>
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
              path="/service-providers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceProviders />
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
                  <Layout>
                    <CommunicationHub />
                  </Layout>
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
                  <RequireRoles roles={["security_officer", "community_admin", "district_coordinator", "state_admin"]}>
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
                  <RequireRoles roles={["security_officer", "community_admin", "district_coordinator", "state_admin"]}>
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
                  <RequireRoles roles={["community_admin", "district_coordinator", "state_admin"]}>
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
                  <RequireRoles roles={["community_admin", "district_coordinator", "state_admin"]}>
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
                  <RequireRoles roles={["community_admin", "district_coordinator", "state_admin"]}>
                    <Layout>
                      <ServiceProviderReview />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/role-diagnostics"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["community_admin", "district_coordinator", "state_admin"]}>
                    <Layout>
                      <RoleDiagnostics />
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
                  <RequireRoles roles={["community_admin", "district_coordinator", "state_admin"]}>
                    <Layout>
                      <CommunityManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/districts"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["state_admin"]}>
                    <Layout>
                      <DistrictManagement />
                    </Layout>
                  </RequireRoles>
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
                  <RequireRoles roles={["facility_manager", "community_admin", "state_admin"]}>
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
                  <RequireRoles roles={['community_admin', 'district_coordinator', 'state_admin']}>
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
                    roles={["security_officer", "state_admin", "community_admin"]}
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

            {/* CCTV Management for admins and security officers */}
            <Route
              path="/admin/cctv-management"
              element={
                <ProtectedRoute>
                  <RequireRoles roles={["security_officer", "community_admin", "state_admin"]}>
                    <Layout>
                      <CCTVManagement />
                    </Layout>
                  </RequireRoles>
                </ProtectedRoute>
              }
            />

            {/* CCTV Live Feed for residents */}
            <Route
              path="/cctv-live-feed"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CCTVLiveFeed />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Security modules */}
            <Route
              path="/panic-alerts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PanicAlerts />
                  </Layout>
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
                  <Layout>
                    <Facilities />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyBookings />
                  </Layout>
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
                  <RequireRoles roles={["facility_manager", "community_admin", "district_coordinator", "state_admin"]}>
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
                  <RequireRoles roles={["community_admin", "district_coordinator", "state_admin"]}>
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
                  <RequireRoles roles={["facility_manager", "maintenance_staff", "community_admin", "district_coordinator", "state_admin"]}>
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
