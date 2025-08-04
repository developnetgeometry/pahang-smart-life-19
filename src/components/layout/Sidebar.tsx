import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Building,
  ShoppingCart,
  Camera,
  Shield,
  Settings,
  UserPlus,
  Wrench,
  AlertTriangle,
  Monitor,
  Radio,
  Megaphone,
  FileText,
  Home,
  Activity
} from 'lucide-react';

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export function AppSidebar() {
  const { currentViewRole, language } = useAuth();
  const { t } = useTranslation(language);
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const residentNavigation: NavigationGroup[] = [
    {
      label: t('nav.dashboard'),
      items: [
        { title: t('nav.dashboard'), url: '/', icon: LayoutDashboard }
      ]
    },
    {
      label: t('nav.myActivities'),
      items: [
        { title: t('nav.myBookings'), url: '/my-bookings', icon: Calendar },
        { title: t('nav.myVisitors'), url: '/my-visitors', icon: Users },
        { title: t('nav.myComplaints'), url: '/my-complaints', icon: FileText },
        { title: t('nav.myProfile'), url: '/my-profile', icon: Settings }
      ]
    },
    {
      label: t('nav.communityHub'),
      items: [
        { title: t('nav.announcements'), url: '/announcements', icon: Megaphone },
        { title: t('nav.discussions'), url: '/discussions', icon: MessageSquare }
      ]
    },
    {
      label: t('nav.servicesAndFacilities'),
      items: [
        { title: t('nav.facilities'), url: '/facilities', icon: Building },
        { title: t('nav.marketplace'), url: '/marketplace', icon: ShoppingCart },
        { title: t('nav.cctvLiveFeed'), url: '/cctv-live', icon: Camera }
      ]
    }
  ];

  const professionalNavigation: NavigationGroup[] = [
    {
      label: t('nav.dashboard'),
      items: [
        { title: t('nav.dashboard'), url: '/', icon: LayoutDashboard }
      ]
    },
    {
      label: t('nav.administration'),
      items: [
        { title: t('nav.userManagement'), url: '/admin/users', icon: UserPlus },
        { title: t('nav.communityManagement'), url: '/admin/communities', icon: Home },
        { title: t('nav.districtManagement'), url: '/admin/districts', icon: Settings }
      ]
    },
    {
      label: t('nav.operations'),
      items: [
        { title: t('nav.facilitiesManagement'), url: '/admin/facilities', icon: Building },
        { title: t('nav.maintenanceManagement'), url: '/admin/maintenance', icon: Wrench },
        { title: t('nav.complaintsManagement'), url: '/admin/complaints', icon: AlertTriangle }
      ]
    },
    {
      label: t('nav.securityAndMonitoring'),
      items: [
        { title: t('nav.securityDashboard'), url: '/admin/security', icon: Shield },
        { title: t('nav.cctvManagement'), url: '/admin/cctv', icon: Camera },
        { title: t('nav.smartMonitoring'), url: '/admin/monitoring', icon: Monitor },
        { title: t('nav.sensorManagement'), url: '/admin/sensors', icon: Radio }
      ]
    },
    {
      label: t('nav.communication'),
      items: [
        { title: t('nav.announcements'), url: '/admin/announcements', icon: Megaphone },
        { title: t('nav.discussions'), url: '/admin/discussions', icon: MessageSquare }
      ]
    }
  ];

  const navigation = currentViewRole === 'resident' ? residentNavigation : professionalNavigation;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="hidden border-r bg-sidebar md:flex">
      <SidebarContent>
        {navigation.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center space-x-2 w-full ${
                            isActive
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'hover:bg-muted/50'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}