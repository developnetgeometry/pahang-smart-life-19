import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MyBookings from "./pages/MyBookings";
import MyVisitors from "./pages/MyVisitors";
import MyComplaints from "./pages/MyComplaints";
import MyProfile from "./pages/MyProfile";
import Announcements from "./pages/Announcements";
import Discussions from "./pages/Discussions";
import Facilities from "./pages/Facilities";
import Marketplace from "./pages/Marketplace";
import CCTVLiveFeed from "./pages/CCTVLiveFeed";
import AdminPanel from "./pages/AdminPanel";
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
import NotFound from "./pages/NotFound";
import ModulesPage from "./pages/ModulesPage";
import MyPayments from "./pages/MyPayments";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import SecurityDashboardPage from "./pages/security/SecurityDashboard";
import ServiceDashboardPage from "./pages/service/ServiceDashboard";
import WorkOrders from "./pages/maintenance/WorkOrders";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import SystemSettings from "./pages/admin/SystemSettings";
import AuditLogs from "./pages/admin/AuditLogs";

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
        <BrowserRouter>
          <Layout>
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
                    <Index />
                  </ProtectedRoute>
                } 
              />
              
              {/* Resident modules */}
              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-visitors" 
                element={
                  <ProtectedRoute>
                    <MyVisitors />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-complaints" 
                element={
                  <ProtectedRoute>
                    <MyComplaints />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-profile" 
                element={
                  <ProtectedRoute>
                    <MyProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/role-management" 
                element={
                  <ProtectedRoute>
                    <RoleManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/announcements" 
                element={
                  <ProtectedRoute>
                    <Announcements />
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="/discussions" 
                element={
                  <ProtectedRoute>
                    <Discussions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/facilities" 
                element={
                  <ProtectedRoute>
                    <Facilities />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketplace" 
                element={
                  <ProtectedRoute>
                    <Marketplace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/communication" 
                element={
                  <ProtectedRoute>
                    <CommunicationHub />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/visitor-security" 
                element={
                  <ProtectedRoute>
                    <VisitorSecurity />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/visitor-analytics" 
                element={
                  <ProtectedRoute>
                    <VisitorAnalytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cctv-live" 
                element={
                  <ProtectedRoute>
                    <CCTVLiveFeed />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/modules" 
                element={
                  <ProtectedRoute>
                    <ModulesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-payments" 
                element={
                  <ProtectedRoute>
                    <MyPayments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />

              {/* Professional view routes */}
              <Route 
                path="/security/dashboard" 
                element={
                  <ProtectedRoute>
                    <SecurityDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/service/dashboard" 
                element={
                  <ProtectedRoute>
                    <ServiceDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/maintenance/work-orders" 
                element={
                  <ProtectedRoute>
                    <WorkOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/security" 
                element={
                  <ProtectedRoute>
                    <SecurityDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/communities" 
                element={
                  <ProtectedRoute>
                    <CommunityManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/districts" 
                element={
                  <ProtectedRoute>
                    <DistrictManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/facilities" 
                element={
                  <ProtectedRoute>
                    <FacilitiesManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/maintenance" 
                element={
                  <ProtectedRoute>
                    <MaintenanceManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/complaints" 
                element={
                  <ProtectedRoute>
                    <ComplaintsManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/cctv" 
                element={
                  <ProtectedRoute>
                    <CCTVManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/smart-monitoring" 
                element={
                  <ProtectedRoute>
                    <SmartMonitoring />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/sensors" 
                element={
                  <ProtectedRoute>
                    <SensorManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/announcements" 
                element={
                  <ProtectedRoute>
                    <AnnouncementManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/discussions" 
                element={
                  <ProtectedRoute>
                    <DiscussionManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute>
                    <SystemSettings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/audit" 
                element={
                  <ProtectedRoute>
                    <AuditLogs />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
