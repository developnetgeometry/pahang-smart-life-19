import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MyBookings from "./pages/MyBookings";
import MyVisitors from "./pages/MyVisitors";
import MyComplaints from "./pages/MyComplaints";
import MyProfile from "./pages/MyProfile";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Discussions from "./pages/Discussions";
import Facilities from "./pages/Facilities";
import Marketplace from "./pages/Marketplace";
import CCTVLiveFeed from "./pages/CCTVLiveFeed";
import UserManagement from "./pages/admin/UserManagement";
import SecurityDashboard from "./pages/admin/SecurityDashboard";
import CommunityManagement from "./pages/admin/CommunityManagement";
import DistrictManagement from "./pages/admin/DistrictManagement";
import MaintenanceManagement from "./pages/admin/MaintenanceManagement";
import ComplaintsManagement from "./pages/admin/ComplaintsManagement";
import CCTVManagement from "./pages/admin/CCTVManagement";
import SmartMonitoring from "./pages/admin/SmartMonitoring";
import SensorManagement from "./pages/admin/SensorManagement";
import AnnouncementManagement from "./pages/admin/AnnouncementManagement";
import FacilitiesManagement from "./pages/admin/FacilitiesManagement";
import DiscussionManagement from "./pages/admin/DiscussionManagement";
import VisitorSecurity from "./pages/VisitorSecurity";
import VisitorAnalytics from "./pages/VisitorAnalytics";
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
import AssetManagement from "./pages/AssetManagement";
import ServiceRequests from "./pages/ServiceRequests";
import FinancialManagement from "./pages/FinancialManagement";
import InventoryManagement from "./pages/InventoryManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            
            {/* Protected Routes */}
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

            {/* Personal Routes - All authenticated users */}
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

            {/* Community Functions */}
            <Route
              path="/announcements"
              element={
                <ProtectedRoute requiredFunction="community">
                  <Layout>
                    <Announcements />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute requiredFunction="community">
                  <Layout>
                    <Events />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions"
              element={
                <ProtectedRoute requiredFunction="community">
                  <Layout>
                    <Discussions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/directory"
              element={
                <ProtectedRoute requiredFunction="community">
                  <Layout>
                    <Directory />
                  </Layout>
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

            {/* Facility Functions */}
            <Route
              path="/facilities"
              element={
                <ProtectedRoute requiredFunction="facilities">
                  <Layout>
                    <Facilities />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Service Functions */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute requiredFunction="services">
                  <Layout>
                    <Marketplace />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-requests"
              element={
                <ProtectedRoute requiredFunction="services">
                  <Layout>
                    <ServiceRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Security Functions */}
            <Route
              path="/cctv-live"
              element={
                <ProtectedRoute requiredFunction="security">
                  <Layout>
                    <CCTVLiveFeed />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-security"
              element={
                <ProtectedRoute requiredFunction="security">
                  <Layout>
                    <VisitorSecurity />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/panic-alerts"
              element={
                <ProtectedRoute requiredFunction="security">
                  <Layout>
                    <PanicAlerts />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Maintenance Functions */}
            <Route
              path="/asset-management"
              element={
                <ProtectedRoute requiredFunction="maintenance" requiredLevel={5}>
                  <Layout>
                    <AssetManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory-management"
              element={
                <ProtectedRoute requiredFunction="maintenance" requiredLevel={5}>
                  <Layout>
                    <InventoryManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Notifications */}
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

            {/* Administrative Functions - Level-based */}
            <Route
              path="/role-management"
              element={
                <ProtectedRoute requiredFunction="administration" requiredLevel={8}>
                  <Layout>
                    <RoleManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/financial-management"
              element={
                <ProtectedRoute requiredFunction="administration" requiredLevel={8}>
                  <Layout>
                    <FinancialManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Level 7+ (Facility Manager+) */}
            <Route
              path="/admin/facilities"
              element={
                <ProtectedRoute requiredLevel={7}>
                  <Layout>
                    <FacilitiesManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/maintenance"
              element={
                <ProtectedRoute requiredLevel={7}>
                  <Layout>
                    <MaintenanceManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Level 8+ (Community Admin+) */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredFunction="administration" requiredLevel={8}>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute requiredFunction="administration" requiredLevel={8}>
                  <Layout>
                    <AnnouncementManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/communities"
              element={
                <ProtectedRoute requiredLevel={8}>
                  <Layout>
                    <CommunityManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute requiredFunction="administration" requiredLevel={8}>
                  <Layout>
                    <ComplaintsManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/discussions"
              element={
                <ProtectedRoute requiredFunction="administration" requiredLevel={8}>
                  <Layout>
                    <DiscussionManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-providers"
              element={
                <ProtectedRoute requiredFunction="administration" requiredLevel={8}>
                  <Layout>
                    <ServiceProviderManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-providers/review/:id"
              element={
                <ProtectedRoute requiredFunction="administration" requiredLevel={8}>
                  <Layout>
                    <ServiceProviderReview />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Security Admin Routes - Level 6+ with Security Function */}
            <Route
              path="/admin/cctv"
              element={
                <ProtectedRoute requiredFunction="security" requiredLevel={6}>
                  <Layout>
                    <CCTVManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Level 9+ (District Coordinator+) */}
            <Route
              path="/admin/districts"
              element={
                <ProtectedRoute requiredLevel={9}>
                  <Layout>
                    <DistrictManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitor-analytics"
              element={
                <ProtectedRoute requiredLevel={9}>
                  <Layout>
                    <VisitorAnalytics />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Level 10 (State Admin) */}
            <Route
              path="/admin/security"
              element={
                <ProtectedRoute requiredLevel={10}>
                  <Layout>
                    <SecurityDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/smart-monitoring"
              element={
                <ProtectedRoute requiredLevel={10}>
                  <Layout>
                    <SmartMonitoring />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sensors"
              element={
                <ProtectedRoute requiredLevel={10}>
                  <Layout>
                    <SensorManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;