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
import { AnnouncementSlideshow } from '@/components/dashboard/AnnouncementSlideshow';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';

const DashboardHeader = () => {
  const { user, language } = useAuth();
  
  const getWelcomeMessage = () => {
    const userName = user?.display_name || 'User';
    return language === 'en' ? `Welcome back, ${userName}` : `Selamat kembali, ${userName}`;
  };

  const getLocationInfo = () => {
    if (!user) return '';
    
    const parts = [];
    if (user.district) parts.push(user.district);
    if (user.unit_type) parts.push(`Unit ${user.unit_type}`);
    
    return parts.join(' - ') || user.address || '';
  };
  
  return (
    <div className="relative mb-6 overflow-hidden rounded-xl">
      <div className="relative bg-background border border-border p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {getWelcomeMessage()}
            </h1>
            <p className="text-muted-foreground text-base">
              {getLocationInfo()}
            </p>
          </div>
          
          <div className="hidden md:block w-80">
            <WeatherWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { hasRole, roles, initializing, language } = useAuth();

  // Show loading while initializing or roles aren't ready
  if (initializing || roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine which dashboard to show based on user's highest role
  if (hasRole('state_admin')) return (
    <div className="space-y-6">
      <DashboardHeader />
      <AnnouncementSlideshow />
      <StateAdminDashboard />
    </div>
  );
  if (hasRole('district_coordinator')) return (
    <div className="space-y-6">
      <DashboardHeader />
      <AnnouncementSlideshow />
      <DistrictCoordinatorDashboard />
    </div>
  );
  if (hasRole('community_admin')) return (
    <div className="space-y-6">
      <DashboardHeader />
      <AnnouncementSlideshow />
      <CommunityAdminDashboard />
    </div>
  );
  if (hasRole('facility_manager')) return (
    <div className="space-y-6">
      <DashboardHeader />
      <AnnouncementSlideshow />
      <FacilityManagerDashboard />
    </div>
  );
  
  if (hasRole('security_officer')) return (
    <div className="space-y-6">
      <DashboardHeader />
      <AnnouncementSlideshow />
      <SecurityOfficerDashboard />
    </div>
  );
  if (hasRole('maintenance_staff')) return (
    <div className="space-y-6">
      <DashboardHeader />
      <AnnouncementSlideshow />
      <MaintenanceStaffDashboard />
    </div>
  );
  if (hasRole('service_provider')) return <ServiceProviderEnhancedDashboard />;
  if (hasRole('community_leader')) return (
    <div className="space-y-6">
      <DashboardHeader />
      <AnnouncementSlideshow />
      <CommunityLeaderDashboard />
    </div>
  );
  if (hasRole('state_service_manager')) return (
    <div className="space-y-6">
      <DashboardHeader />
      <AnnouncementSlideshow />
      <StateServiceManagerDashboard />
    </div>
  );
  
  // Only show resident dashboard if user actually has resident role
  if (hasRole('resident')) return (
    <div className="space-y-6">
      <DashboardHeader />
      <AnnouncementSlideshow />
      <ResidentDashboard />
    </div>
  );
  
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
