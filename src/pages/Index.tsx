import { useAuth } from '@/contexts/AuthContext';
import { StateAdminDashboard } from '@/components/dashboard/StateAdminDashboard';
import { DistrictCoordinatorDashboard } from '@/components/dashboard/DistrictCoordinatorDashboard';
import { CommunityAdminDashboard } from '@/components/dashboard/CommunityAdminDashboard';
import { FacilityManagerDashboard } from '@/components/dashboard/FacilityManagerDashboard';
import { SecurityOfficerDashboard } from '@/components/dashboard/SecurityOfficerDashboard';
import { MaintenanceStaffDashboard } from '@/components/dashboard/MaintenanceStaffDashboard';
import { ServiceProviderDashboard } from '@/components/dashboard/ServiceProviderDashboard';
import { CommunityLeaderDashboard } from '@/components/dashboard/CommunityLeaderDashboard';
import { StateServiceManagerDashboard } from '@/components/dashboard/StateServiceManagerDashboard';
import { ResidentDashboard } from '@/components/dashboard/ResidentDashboard';

const Index = () => {
  const { hasRole } = useAuth();

  // Determine which dashboard to show based on user's highest role
  if (hasRole('state_admin')) return <StateAdminDashboard />;
  if (hasRole('district_coordinator')) return <DistrictCoordinatorDashboard />;
  if (hasRole('community_admin')) return <CommunityAdminDashboard />;
  if (hasRole('facility_manager')) return <FacilityManagerDashboard />;
  if (hasRole('security_officer')) return <SecurityOfficerDashboard />;
  if (hasRole('maintenance_staff')) return <MaintenanceStaffDashboard />;
  if (hasRole('service_provider')) return <ServiceProviderDashboard />;
  if (hasRole('community_leader')) return <CommunityLeaderDashboard />;
  if (hasRole('state_service_manager')) return <StateServiceManagerDashboard />;
  
  // Default to resident dashboard
  return <ResidentDashboard />;
};
export default Index;
