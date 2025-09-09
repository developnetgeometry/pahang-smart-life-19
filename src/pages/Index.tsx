import { useAuth } from '@/contexts/AuthContext';
import { StateAdminDashboard } from '@/components/dashboard/StateAdminDashboard';
import { DistrictCoordinatorDashboard } from '@/components/dashboard/DistrictCoordinatorDashboard';
import { CommunityAdminDashboard } from '@/components/dashboard/CommunityAdminDashboard';
import { FacilityManagerDashboard } from '@/components/dashboard/FacilityManagerDashboard';
import { SecurityOfficerDashboard } from '@/components/dashboard/SecurityOfficerDashboard';
import { MaintenanceStaffDashboard } from '@/components/dashboard/MaintenanceStaffDashboard';
import ServiceProviderEnhancedDashboard from '@/components/dashboard/ServiceProviderEnhancedDashboard';
import { CommunityLeaderDashboard } from '@/components/dashboard/CommunityLeaderDashboard';
import { StateServiceManagerDashboard } from '@/components/dashboard/StateServiceManagerDashboard';
import { ResidentDashboard } from '@/components/dashboard/ResidentDashboard';

const Index = () => {
  const { hasRole, roles, initializing } = useAuth();

  // Show loading while initializing or roles aren't ready
  if (initializing || roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine which dashboard to show based on user's highest role
  if (hasRole('state_admin')) return <StateAdminDashboard />;
  if (hasRole('district_coordinator')) return <DistrictCoordinatorDashboard />;
  if (hasRole('community_admin')) return <CommunityAdminDashboard />;
  if (hasRole('facility_manager')) return <FacilityManagerDashboard />;
  
  if (hasRole('security_officer')) return <SecurityOfficerDashboard />;
  if (hasRole('maintenance_staff')) return <MaintenanceStaffDashboard />;
  if (hasRole('service_provider')) return <ServiceProviderEnhancedDashboard />;
  if (hasRole('community_leader')) return <CommunityLeaderDashboard />;
  if (hasRole('state_service_manager')) return <StateServiceManagerDashboard />;
  
  // Only show resident dashboard if user actually has resident role
  if (hasRole('resident')) return <ResidentDashboard />;
  
  // If no roles match, show a neutral state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">No assigned roles found.</p>
        <p className="text-sm text-muted-foreground">Please contact your administrator.</p>
      </div>
    </div>
  );
};
export default Index;
