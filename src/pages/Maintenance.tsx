import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarTrigger,
  useSidebar 
} from '@/components/ui/sidebar';
import { MaintenanceReports } from '@/components/maintenance/MaintenanceReports';
import { MaintenanceScheduler } from '@/components/maintenance/MaintenanceScheduler';
import { MaintenanceAssets } from '@/components/maintenance/MaintenanceAssets';
import { 
  FileText, 
  Calendar, 
  Package, 
  Wrench 
} from 'lucide-react';

type MaintenanceView = 'reports' | 'scheduler' | 'assets';

function MaintenanceSidebar({ activeView, onViewChange }: { 
  activeView: MaintenanceView; 
  onViewChange: (view: MaintenanceView) => void; 
}) {
  const { state } = useSidebar();
  const { language } = useAuth();
  const collapsed = state === "collapsed";

  const menuItems = [
    {
      id: 'reports' as MaintenanceView,
      title: language === 'ms' ? 'Laporan' : 'Reports',
      icon: FileText
    },
    {
      id: 'scheduler' as MaintenanceView,
      title: language === 'ms' ? 'Jadual' : 'Scheduler',
      icon: Calendar
    },
    {
      id: 'assets' as MaintenanceView,
      title: language === 'ms' ? 'Aset' : 'Assets',
      icon: Package
    }
  ];

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            {!collapsed && (language === 'ms' ? 'Penyelenggaraan' : 'Maintenance')}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.id)}
                    className={activeView === item.id ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function Maintenance() {
  const [activeView, setActiveView] = useState<MaintenanceView>('reports');
  const { language } = useAuth();

  const renderContent = () => {
    switch (activeView) {
      case 'reports':
        return <MaintenanceReports />;
      case 'scheduler':
        return <MaintenanceScheduler />;
      case 'assets':
        return <MaintenanceAssets />;
      default:
        return <MaintenanceReports />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <MaintenanceSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
            <div className="ml-2 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">
                {language === 'ms' ? 'Pengurusan Penyelenggaraan' : 'Maintenance Management'}
              </h1>
            </div>
          </header>
          
          <div className="flex-1">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}