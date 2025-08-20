import { useAuth, UserRole } from '@/contexts/AuthContext';
import { StateAdminDashboard } from '@/pages/dashboards/StateAdminDashboard';
import { DistrictCoordinatorDashboard } from '@/pages/dashboards/DistrictCoordinatorDashboard';
import { CommunityAdminDashboard } from '@/pages/dashboards/CommunityAdminDashboard';
import { FacilityManagerDashboard } from '@/pages/dashboards/FacilityManagerDashboard';
import { SecurityOfficerDashboard } from '@/pages/dashboards/SecurityOfficerDashboard';
import { MaintenanceStaffDashboard } from '@/pages/dashboards/MaintenanceStaffDashboard';
import { ResidentDashboard } from '@/pages/dashboards/ResidentDashboard';
import { ServiceProviderDashboard } from '@/pages/dashboards/ServiceProviderDashboard';
import { CommunityLeaderDashboard } from '@/pages/dashboards/CommunityLeaderDashboard';
import { StateServiceManagerDashboard } from '@/pages/dashboards/StateServiceManagerDashboard';

export function RoleBasedRouter() {
  const { user } = useAuth();
  
  if (!user || !user.primary_role) {
    return <ResidentDashboard />;
  }

  switch (user.primary_role) {
    case UserRole.STATE_ADMIN:
      return <StateAdminDashboard />;
    case UserRole.DISTRICT_COORDINATOR:
      return <DistrictCoordinatorDashboard />;
    case UserRole.COMMUNITY_ADMIN:
      return <CommunityAdminDashboard />;
    case UserRole.FACILITY_MANAGER:
      return <FacilityManagerDashboard />;
    case UserRole.SECURITY_OFFICER:
      return <SecurityOfficerDashboard />;
    case UserRole.MAINTENANCE_STAFF:
      return <MaintenanceStaffDashboard />;
    case UserRole.SERVICE_PROVIDER:
      return <ServiceProviderDashboard />;
    case UserRole.COMMUNITY_LEADER:
      return <CommunityLeaderDashboard />;
    case UserRole.STATE_SERVICE_MANAGER:
      return <StateServiceManagerDashboard />;
    case UserRole.RESIDENT:
    default:
      return <ResidentDashboard />;
  }
}