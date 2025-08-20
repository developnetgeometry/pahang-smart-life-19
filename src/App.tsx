import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EnhancedAuthProvider, useEnhancedAuth } from "@/hooks/useEnhancedAuth";
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { RoleGuard } from "@/components/auth/RoleGuard";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useEnhancedAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useEnhancedAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <EnhancedAuthProvider>
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
                    <RoleGuard module="my_bookings" permission="read">
                      <MyBookings />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-visitors" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="visitors" permission="read">
                      <MyVisitors />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-complaints" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="complaints" permission="read">
                      <MyComplaints />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-profile" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="profile" permission="read">
                      <MyProfile />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/role-management" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="role_management" permission="read">
                      <RoleManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/announcements" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="announcements" permission="read">
                      <Announcements />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="/discussions" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="discussions" permission="read">
                      <Discussions />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/facilities" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="facilities" permission="read">
                      <Facilities />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketplace" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="marketplace" permission="read">
                      <Marketplace />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/communication-hub" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="communication" permission="read">
                      <CommunicationHub />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/visitor-security" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="visitor_security" permission="read" requiredLevel={6}>
                      <VisitorSecurity />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/visitor-analytics" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="visitor_analytics" permission="read" requiredLevel={6}>
                      <VisitorAnalytics />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cctv-live-feed" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="cctv" permission="read" requiredLevel={6}>
                      <CCTVLiveFeed />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />

              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <RoleGuard module="admin_panel" permission="read" requiredLevel={8}>
                      <AdminPanel />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={9}>
                      <UserManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/security" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={8}>
                      <SecurityDashboard />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/communities" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={8}>
                      <CommunityManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/districts" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={9}>
                      <DistrictManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/facilities" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={7}>
                      <FacilitiesManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/maintenance" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={5}>
                      <MaintenanceManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/complaints" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={8}>
                      <ComplaintsManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/cctv" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={6}>
                      <CCTVManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/smart-monitoring" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={8}>
                      <SmartMonitoring />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/sensors" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={8}>
                      <SensorManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/announcements" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={8}>
                      <AnnouncementManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/discussions" 
                element={
                  <ProtectedRoute>
                    <RoleGuard requiredLevel={8}>
                      <DiscussionManagement />
                    </RoleGuard>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </EnhancedAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
