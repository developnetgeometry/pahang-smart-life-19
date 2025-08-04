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
      label: language === 'en' ? 'Dashboard' : 'Papan Pemuka',
      items: [
        { title: language === 'en' ? 'Dashboard' : 'Papan Pemuka', url: '/', icon: LayoutDashboard }
      ]
    },
    {
      label: language === 'en' ? 'My Activities' : 'Aktiviti Saya',
      items: [
        { title: language === 'en' ? 'My Bookings' : 'Tempahan Saya', url: '/my-bookings', icon: Calendar },
        { title: language === 'en' ? 'My Visitors' : 'Pelawat Saya', url: '/my-visitors', icon: Users },
        { title: language === 'en' ? 'My Complaints' : 'Aduan Saya', url: '/my-complaints', icon: FileText },
        { title: language === 'en' ? 'My Profile' : 'Profil Saya', url: '/my-profile', icon: Settings }
      ]
    },
    {
      label: language === 'en' ? 'Community Hub' : 'Hub Komuniti',
      items: [
        { title: language === 'en' ? 'Announcements' : 'Pengumuman', url: '/announcements', icon: Megaphone },
        { title: language === 'en' ? 'Discussions' : 'Perbincangan', url: '/discussions', icon: MessageSquare }
      ]
    },
    {
      label: language === 'en' ? 'Services & Facilities' : 'Perkhidmatan & Kemudahan',
      items: [
        { title: language === 'en' ? 'Facilities' : 'Kemudahan', url: '/facilities', icon: Building },
        { title: language === 'en' ? 'Marketplace' : 'Pasar Maya', url: '/marketplace', icon: ShoppingCart },
        { title: language === 'en' ? 'CCTV Live Feed' : 'Siaran Langsung CCTV', url: '/cctv-live', icon: Camera }
      ]
    }
  ];

  const professionalNavigation: NavigationGroup[] = [
    {
      label: language === 'en' ? 'Dashboard' : 'Papan Pemuka',
      items: [
        { title: language === 'en' ? 'Dashboard' : 'Papan Pemuka', url: '/', icon: LayoutDashboard }
      ]
    },
    {
      label: language === 'en' ? 'Administration' : 'Pentadbiran',
      items: [
        { title: language === 'en' ? 'User Management' : 'Pengurusan Pengguna', url: '/admin/users', icon: UserPlus },
        { title: language === 'en' ? 'Community Management' : 'Pengurusan Komuniti', url: '/admin/communities', icon: Home },
        { title: language === 'en' ? 'District Management' : 'Pengurusan Daerah', url: '/admin/districts', icon: Settings }
      ]
    },
    {
      label: language === 'en' ? 'Operations' : 'Operasi',
      items: [
        { title: language === 'en' ? 'Facilities Management' : 'Pengurusan Kemudahan', url: '/admin/facilities', icon: Building },
        { title: language === 'en' ? 'Maintenance Management' : 'Pengurusan Penyelenggaraan', url: '/admin/maintenance', icon: Wrench },
        { title: language === 'en' ? 'Complaints Management' : 'Pengurusan Aduan', url: '/admin/complaints', icon: AlertTriangle }
      ]
    },
    {
      label: language === 'en' ? 'Security & Monitoring' : 'Keselamatan & Pemantauan',
      items: [
        { title: language === 'en' ? 'Security Dashboard' : 'Papan Pemuka Keselamatan', url: '/admin/security', icon: Shield },
        { title: language === 'en' ? 'CCTV Management' : 'Pengurusan CCTV', url: '/admin/cctv', icon: Camera },
        { title: language === 'en' ? 'Smart Monitoring' : 'Pemantauan Pintar', url: '/admin/monitoring', icon: Monitor },
        { title: language === 'en' ? 'Sensor Management' : 'Pengurusan Sensor', url: '/admin/sensors', icon: Radio }
      ]
    },
    {
      label: language === 'en' ? 'Communication' : 'Komunikasi',
      items: [
        { title: language === 'en' ? 'Announcements' : 'Pengumuman', url: '/admin/announcements', icon: Megaphone },
        { title: language === 'en' ? 'Discussions' : 'Perbincangan', url: '/admin/discussions', icon: MessageSquare }
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