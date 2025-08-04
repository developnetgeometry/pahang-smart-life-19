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
                    <div className="text-center py-20">
                      <h1 className="text-2xl font-bold">Discussions</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/facilities" 
                element={
                  <ProtectedRoute>
                    <div className="text-center py-20">
                      <h1 className="text-2xl font-bold">Facilities</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketplace" 
                element={
                  <ProtectedRoute>
                    <div className="text-center py-20">
                      <h1 className="text-2xl font-bold">Marketplace</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cctv-live" 
                element={
                  <ProtectedRoute>
                    <div className="text-center py-20">
                      <h1 className="text-2xl font-bold">CCTV Live Feed</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />

              {/* Professional view routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <div className="text-center py-20">
                      <h1 className="text-2xl font-bold">Admin Panel</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
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
