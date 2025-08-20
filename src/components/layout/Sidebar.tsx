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
  Activity,
  Bell
} from 'lucide-react';

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRoles?: string[];
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export function AppSidebar() {
  const { language, hasRole } = useAuth();
  const { t } = useTranslation(language);
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Role-based navigation groups - enhanced filtering
  const getNavigationForUser = () => {
    const nav: NavigationGroup[] = [];

    // Dashboard - available to all authenticated users
    nav.push({
      label: t('dashboard'),
      items: [
        { title: t('dashboard'), url: '/', icon: LayoutDashboard }
      ]
    });

    // Personal Activities - available to all users
    nav.push({
      label: t('myActivities'),
      items: [
        { title: t('myBookings'), url: '/my-bookings', icon: Calendar },
        { title: t('myVisitors'), url: '/my-visitors', icon: Users },
        { title: t('myComplaints'), url: '/my-complaints', icon: FileText },
        { title: t('notificationSettings'), url: '/notification-settings', icon: Bell }
      ]
    });

    // Community Hub - available to all users
    nav.push({
      label: t('communityHub'),
      items: [
        { title: t('communication'), url: '/communication', icon: MessageSquare },
        { title: t('announcements'), url: '/announcements', icon: Megaphone },
        { title: t('discussions'), url: '/discussions', icon: MessageSquare }
      ]
    });

    // Services & Facilities - available to all users
    nav.push({
      label: t('servicesAndFacilities'),
      items: [
        { title: t('facilities'), url: '/facilities', icon: Building },
        { title: t('marketplace'), url: '/marketplace', icon: ShoppingCart },
        { title: t('cctvLiveFeed'), url: '/cctv-live', icon: Camera }
      ]
    });

    // Administration - only for admin and manager roles
    const adminItems = [];
    if (hasRole('admin') || hasRole('manager')) {
      adminItems.push(
        { title: t('userManagement'), url: '/admin/users', icon: UserPlus, requiredRoles: ['admin', 'manager'] },
        { title: t('communityManagement'), url: '/admin/communities', icon: Home, requiredRoles: ['admin', 'manager'] }
      );
    }
    
    if (hasRole('admin')) {
      adminItems.push(
        { title: t('districtManagement'), url: '/admin/districts', icon: Settings, requiredRoles: ['admin'] }
      );
    }
    
    if (adminItems.length > 0) {
      nav.push({
        label: t('administration'),
        items: adminItems
      });
    }

    // Operations Management - for admin and manager roles
    const operationsItems = [];
    if (hasRole('admin') || hasRole('manager')) {
      operationsItems.push(
        { title: t('facilitiesManagement'), url: '/admin/facilities', icon: Building, requiredRoles: ['admin', 'manager'] },
        { title: t('maintenanceManagement'), url: '/admin/maintenance', icon: Wrench, requiredRoles: ['admin', 'manager'] },
        { title: t('complaintsManagement'), url: '/admin/complaints', icon: AlertTriangle, requiredRoles: ['admin', 'manager'] }
      );
    }
    
    if (operationsItems.length > 0) {
      nav.push({
        label: t('operations'),
        items: operationsItems
      });
    }

    // Security & Monitoring - for security, admin, and manager roles
    const securityItems = [];
    if (hasRole('security_officer') || hasRole('admin') || hasRole('manager')) {
      securityItems.push(
        { title: t('panicAlerts'), url: '/panic-alerts', icon: AlertTriangle, requiredRoles: ['security_officer', 'admin', 'manager'] },
        { title: t('visitorSecurity'), url: '/visitor-security', icon: Shield, requiredRoles: ['security', 'admin', 'manager'] },
        { title: t('cctvManagement'), url: '/admin/cctv', icon: Camera, requiredRoles: ['security', 'admin', 'manager'] }
      );
    }
    
    if (hasRole('admin') || hasRole('manager')) {
      securityItems.push(
        { title: t('visitorAnalytics'), url: '/visitor-analytics', icon: Activity, requiredRoles: ['admin', 'manager'] },
        { title: t('smartMonitoring'), url: '/admin/smart-monitoring', icon: Monitor, requiredRoles: ['admin', 'manager'] },
        { title: t('sensorManagement'), url: '/admin/sensors', icon: Radio, requiredRoles: ['admin', 'manager'] }
      );
    }
    
    if (securityItems.length > 0) {
      nav.push({
        label: t('securityAndMonitoring'),
        items: securityItems
      });
    }

    // Communication Management - for admin and manager roles
    const commMgmtItems = [];
    if (hasRole('admin') || hasRole('manager')) {
      commMgmtItems.push(
        { title: t('announcementManagement'), url: '/admin/announcements', icon: Megaphone, requiredRoles: ['admin', 'manager'] },
        { title: t('discussionManagement'), url: '/admin/discussions', icon: MessageSquare, requiredRoles: ['admin', 'manager'] }
      );
    }
    
    if (commMgmtItems.length > 0) {
      nav.push({
        label: t('communicationManagement'),
        items: commMgmtItems
      });
    }

    return nav;
  };

  const navigation = getNavigationForUser();
  const canSee = (item: NavigationItem) => !item.requiredRoles || item.requiredRoles.some(r => hasRole?.(r as any));
  const filteredNavigation = navigation
    .map((group) => ({ ...group, items: group.items.filter(canSee) }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon">
      {/* Logo section */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">SC</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Smart Community</span>
              <span className="text-xs text-muted-foreground">Pahang</span>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        {filteredNavigation.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-muted-foreground">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
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