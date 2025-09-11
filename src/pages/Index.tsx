import { useAuth } from "@/contexts/AuthContext";
import { StateAdminDashboard } from "@/components/dashboard/StateAdminDashboard";
import { DistrictCoordinatorDashboard } from "@/components/dashboard/DistrictCoordinatorDashboard";
import { CommunityAdminDashboard } from "@/components/dashboard/CommunityAdminDashboard";
import { FacilityManagerDashboard } from "@/components/dashboard/FacilityManagerDashboard";
import { SecurityOfficerDashboard } from "@/components/dashboard/SecurityOfficerDashboard";
import { MaintenanceStaffDashboard } from "@/components/dashboard/MaintenanceStaffDashboard";
import ServiceProviderEnhancedDashboard from "@/components/dashboard/ServiceProviderEnhancedDashboard";
import { CommunityLeaderDashboard } from "@/components/dashboard/CommunityLeaderDashboard";
import { StateServiceManagerDashboard } from "@/components/dashboard/StateServiceManagerDashboard";
import { ResidentDashboard } from "@/components/dashboard/ResidentDashboard";
import { AnnouncementSlideshow } from "@/components/dashboard/AnnouncementSlideshow";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { useState, useEffect } from "react";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";

const Index = () => {
  const { hasRole, roles, initializing, user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [dashboardReady, setDashboardReady] = useState(false);

  // Check if this is first visit this session
  const isFirstVisit = !sessionStorage.getItem("dashboardVisited");

  // Handle authentication flow
  useEffect(() => {
    if (!initializing && user && roles.length > 0) {
      if (isFirstVisit) {
        // First time loading - show welcome animation
        sessionStorage.setItem("dashboardVisited", "true");
        setShowWelcome(true);

        // After animation, show dashboard
        const timer = setTimeout(() => {
          setShowWelcome(false);
          setDashboardReady(true);
        }, 2000);

        return () => clearTimeout(timer);
      } else {
        // Already visited - load dashboard directly
        setDashboardReady(true);
      }
    } else if (!initializing && !user) {
      // User logged out - reset everything
      sessionStorage.removeItem("dashboardVisited");
      setShowWelcome(false);
      setDashboardReady(false);
    }
  }, [initializing, user, roles, isFirstVisit]);

  // Show loading skeleton only during initial authentication
  if (initializing || (!user && isFirstVisit)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center mb-8">
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <Sparkles className="h-4 w-4 text-primary/60 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground animate-pulse">
                  Loading your dashboard...
                </p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we prepare everything for you
                </p>
              </div>
            </div>
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Show simple loading for role data if needed
  if (user && !showWelcome && !dashboardReady && roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome animation after successful login
  if (showWelcome && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="text-center space-y-6 animate-in zoom-in-50 duration-1000">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-75 duration-500 delay-300">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400 animate-in zoom-in-50 duration-300 delay-700" />
            </div>
            <Sparkles className="h-6 w-6 text-green-500 absolute -top-1 -right-1 animate-bounce" />
          </div>

          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-700 delay-500">
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
              Welcome back, {user.display_name}! 🎉
            </h1>
            <p className="text-green-600 dark:text-green-300">
              Successfully logged in. Preparing your dashboard...
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-32 h-1 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-[loading_2s_ease-in-out] w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard with entrance animation
  if (!dashboardReady) {
    return null;
  }

  const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      {children}
    </div>
  );

  // Show loading while initializing or roles aren't ready
  if (initializing || roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine which dashboard to show based on user's highest role
  if (hasRole("state_admin"))
    return (
      <DashboardWrapper>
        <StateAdminDashboard />
      </DashboardWrapper>
    );
  if (hasRole("district_coordinator"))
    return (
      <DashboardWrapper>
        <DistrictCoordinatorDashboard />
      </DashboardWrapper>
    );
  if (hasRole("community_admin"))
    return (
      <DashboardWrapper>
        <CommunityAdminDashboard />
      </DashboardWrapper>
    );
  if (hasRole("facility_manager"))
    return (
      <DashboardWrapper>
        <FacilityManagerDashboard />
      </DashboardWrapper>
    );

  if (hasRole("security_officer"))
    return (
      <DashboardWrapper>
        <SecurityOfficerDashboard />
      </DashboardWrapper>
    );
  if (hasRole("maintenance_staff"))
    return (
      <DashboardWrapper>
        <MaintenanceStaffDashboard />
      </DashboardWrapper>
    );
  if (hasRole("service_provider"))
    return (
      <DashboardWrapper>
        <ServiceProviderEnhancedDashboard />
      </DashboardWrapper>
    );
  if (hasRole("community_leader"))
    return (
      <DashboardWrapper>
        <CommunityLeaderDashboard />
      </DashboardWrapper>
    );
  if (hasRole("state_service_manager"))
    return (
      <DashboardWrapper>
        <StateServiceManagerDashboard />
      </DashboardWrapper>
    );

  // Only show resident dashboard if user actually has resident role
  if (hasRole("resident"))
    return (
      <DashboardWrapper>
        <ResidentDashboard />
      </DashboardWrapper>
    );

  // If no roles match, show a neutral state
  return (
    <div className="min-h-screen flex items-center justify-center animate-in fade-in-50 duration-500">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">No assigned roles found.</p>
        <p className="text-sm text-muted-foreground">
          Please contact your administrator.
        </p>
      </div>
    </div>
  );
};
export default Index;
