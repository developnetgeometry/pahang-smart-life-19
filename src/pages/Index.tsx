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
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { Loader2, Sparkles } from "lucide-react";

const Index = () => {
  const { hasRole, roles, initializing, user } = useAuth();

  // Show loading skeleton during initial authentication
  if (initializing || !user) {
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
  if (roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      {children}
    </div>
  );

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