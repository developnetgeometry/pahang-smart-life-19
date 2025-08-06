import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                path="/cctv-live" 
                element={
                  <ProtectedRoute>
                    <CCTVLiveFeed />
                  </ProtectedRoute>
                } 
              />

              {/* Professional view routes */}
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
