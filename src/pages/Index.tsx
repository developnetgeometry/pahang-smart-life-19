import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
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
  if (hasRole('state_admin')) return <Layout><StateAdminDashboard /></Layout>;
  if (hasRole('district_coordinator')) return <Layout><DistrictCoordinatorDashboard /></Layout>;
  if (hasRole('community_admin')) return <Layout><CommunityAdminDashboard /></Layout>;
  if (hasRole('facility_manager')) return <Layout><FacilityManagerDashboard /></Layout>;
  if (hasRole('security_officer')) return <Layout><SecurityOfficerDashboard /></Layout>;
  if (hasRole('maintenance_staff')) return <Layout><MaintenanceStaffDashboard /></Layout>;
  if (hasRole('service_provider')) return <Layout><ServiceProviderDashboard /></Layout>;
  if (hasRole('community_leader')) return <Layout><CommunityLeaderDashboard /></Layout>;
  if (hasRole('state_service_manager')) return <Layout><StateServiceManagerDashboard /></Layout>;
  
  // Default to resident dashboard
  return <Layout><ResidentDashboard /></Layout>;
};

export default Index;
