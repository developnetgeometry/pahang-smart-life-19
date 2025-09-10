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
import { Calendar, Clock } from 'lucide-react';

const DashboardHeader = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const currentDate = new Date();
  
  return (
    <div className="relative mb-6 overflow-hidden rounded-xl">
      <div className="relative h-32 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        {/* Background pattern/texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-amber-600/10 to-yellow-500/20" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative h-full flex flex-col justify-between p-6 text-white">
          {/* Top section with date and time */}
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1 backdrop-blur-sm">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'numeric', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1 backdrop-blur-sm">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {currentDate.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                }).toUpperCase()}
              </span>
            </div>
          </div>
          
          {/* Bottom section with title and subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {title}
            </h1>
            <p className="text-white/80 text-base">
              {subtitle}
            </p>
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
      <DashboardHeader 
        title={language === 'en' ? 'State Admin Dashboard' : 'Papan Pemuka Admin Negeri'}
        subtitle={language === 'en' ? 'State-wide management and oversight' : 'Pengurusan dan pengawasan seluruh negeri'}
      />
      <AnnouncementSlideshow />
      <StateAdminDashboard />
    </div>
  );
  if (hasRole('district_coordinator')) return (
    <div className="space-y-6">
      <DashboardHeader 
        title={language === 'en' ? 'District Coordinator Dashboard' : 'Papan Pemuka Penyelaras Daerah'}
        subtitle={language === 'en' ? 'District coordination and community oversight' : 'Penyelarasan daerah dan pengawasan komuniti'}
      />
      <AnnouncementSlideshow />
      <DistrictCoordinatorDashboard />
    </div>
  );
  if (hasRole('community_admin')) return (
    <div className="space-y-6">
      <DashboardHeader 
        title={language === 'en' ? 'Community Admin Dashboard' : 'Papan Pemuka Admin Komuniti'}
        subtitle={language === 'en' ? 'Community management and resident services' : 'Pengurusan komuniti dan perkhidmatan penduduk'}
      />
      <AnnouncementSlideshow />
      <CommunityAdminDashboard />
    </div>
  );
  if (hasRole('facility_manager')) return (
    <div className="space-y-6">
      <DashboardHeader 
        title={language === 'en' ? 'Facility Manager Dashboard' : 'Papan Pemuka Pengurus Kemudahan'}
        subtitle={language === 'en' ? 'Facility management and maintenance oversight' : 'Pengurusan kemudahan dan pengawasan penyelenggaraan'}
      />
      <AnnouncementSlideshow />
      <FacilityManagerDashboard />
    </div>
  );
  
  if (hasRole('security_officer')) return (
    <div className="space-y-6">
      <DashboardHeader 
        title={language === 'en' ? 'Security Officer Dashboard' : 'Papan Pemuka Pegawai Keselamatan'}
        subtitle={language === 'en' ? 'Security monitoring and incident management' : 'Pemantauan keselamatan dan pengurusan insiden'}
      />
      <AnnouncementSlideshow />
      <SecurityOfficerDashboard />
    </div>
  );
  if (hasRole('maintenance_staff')) return (
    <div className="space-y-6">
      <DashboardHeader 
        title={language === 'en' ? 'Maintenance Staff Dashboard' : 'Papan Pemuka Kakitangan Penyelenggaraan'}
        subtitle={language === 'en' ? 'Maintenance tasks and work order management' : 'Tugas penyelenggaraan dan pengurusan perintah kerja'}
      />
      <AnnouncementSlideshow />
      <MaintenanceStaffDashboard />
    </div>
  );
  if (hasRole('service_provider')) return <ServiceProviderEnhancedDashboard />;
  if (hasRole('community_leader')) return (
    <div className="space-y-6">
      <DashboardHeader 
        title={language === 'en' ? 'Community Leader Dashboard' : 'Papan Pemuka Ketua Komuniti'}
        subtitle={language === 'en' ? 'Community leadership and resident coordination' : 'Kepimpinan komuniti dan penyelarasan penduduk'}
      />
      <AnnouncementSlideshow />
      <CommunityLeaderDashboard />
    </div>
  );
  if (hasRole('state_service_manager')) return (
    <div className="space-y-6">
      <DashboardHeader 
        title={language === 'en' ? 'State Service Manager Dashboard' : 'Papan Pemuka Pengurus Perkhidmatan Negeri'}
        subtitle={language === 'en' ? 'State service management and coordination' : 'Pengurusan dan penyelarasan perkhidmatan negeri'}
      />
      <AnnouncementSlideshow />
      <StateServiceManagerDashboard />
    </div>
  );
  
  // Only show resident dashboard if user actually has resident role
  if (hasRole('resident')) return (
    <div className="space-y-6">
      <DashboardHeader 
        title={language === 'en' ? 'Resident Dashboard' : 'Papan Pemuka Penduduk'}
        subtitle={language === 'en' ? 'Community services and personal management' : 'Perkhidmatan komuniti dan pengurusan peribadi'}
      />
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
