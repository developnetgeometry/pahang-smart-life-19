import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  const location = useLocation();

  const residentNavigation: NavigationGroup[] = [
    {
      label: t('dashboard'),
      items: [
        { title: t('dashboard'), url: '/', icon: LayoutDashboard }
      ]
    },
    {
      label: t('myActivities'),
      items: [
        { title: t('myBookings'), url: '/my-bookings', icon: Calendar },
        { title: t('myVisitors'), url: '/my-visitors', icon: Users },
        { title: t('myComplaints'), url: '/my-complaints', icon: FileText },
        { title: t('myProfile'), url: '/my-profile', icon: Settings }
      ]
    },
    {
      label: t('communityHub'),
      items: [
        { title: t('announcements'), url: '/announcements', icon: Megaphone },
        { title: t('discussions'), url: '/discussions', icon: MessageSquare }
      ]
    },
    {
      label: t('servicesAndFacilities'),
      items: [
        { title: t('facilities'), url: '/facilities', icon: Building },
        { title: t('marketplace'), url: '/marketplace', icon: ShoppingCart },
        { title: t('cctvLiveFeed'), url: '/cctv-live', icon: Camera }
      ]
    }
  ];

  const professionalNavigation: NavigationGroup[] = [
    {
      label: t('dashboard'),
      items: [
        { title: t('dashboard'), url: '/', icon: LayoutDashboard }
      ]
    },
    {
      label: t('administration'),
      items: [
        { title: t('userManagement'), url: '/admin/users', icon: UserPlus },
        { title: t('communityManagement'), url: '/admin/communities', icon: Home },
        { title: t('districtManagement'), url: '/admin/districts', icon: Settings }
      ]
    },
    {
      label: t('operations'),
      items: [
        { title: t('facilitiesManagement'), url: '/admin/facilities', icon: Building },
        { title: t('maintenanceManagement'), url: '/admin/maintenance', icon: Wrench },
        { title: t('complaintsManagement'), url: '/admin/complaints', icon: AlertTriangle }
      ]
    },
    {
      label: t('securityAndMonitoring'),
      items: [
        { title: t('securityDashboard'), url: '/admin/security', icon: Shield },
        { title: t('cctvManagement'), url: '/admin/cctv', icon: Camera },
        { title: t('smartMonitoring'), url: '/admin/monitoring', icon: Monitor },
        { title: t('sensorManagement'), url: '/admin/sensors', icon: Radio }
      ]
    },
    {
      label: t('communication'),
      items: [
        { title: t('announcements'), url: '/admin/announcements', icon: Megaphone },
        { title: t('discussions'), url: '/admin/discussions', icon: MessageSquare }
      ]
    }
  ];

  const navigation = currentViewRole === 'resident' ? residentNavigation : professionalNavigation;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-full w-full flex-col bg-card border-r border-border">
      {/* Logo section */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">SC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Smart Community</span>
            <span className="text-xs text-muted-foreground">Pahang</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-4">
          {navigation.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground px-3 py-2">
                {group.label}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.url}
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
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
              {groupIndex < navigation.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}