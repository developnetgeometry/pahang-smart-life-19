import { Link, useLocation } from 'react-router-dom';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Megaphone,
  Building,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  ShoppingCart,
  Video,
  UserCheck,
  Settings,
  Shield,
  BarChart,
  MessageCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  isAdminOnly?: boolean;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
  {
    title: 'Overview',
    items: [
      {
        path: '/',
        label: 'Dashboard',
        icon: Home,
      },
    ],
  },
  {
    title: 'Personal',
    items: [
      {
        path: '/my-bookings',
        label: 'My Bookings',
        icon: Calendar,
      },
      {
        path: '/my-complaints',
        label: 'My Complaints',
        icon: FileText,
      },
      {
        path: '/my-visitors',
        label: 'My Visitors',
        icon: UserCheck,
      },
      {
        path: '/my-profile',
        label: 'My Profile',
        icon: User,
      },
    ],
  },
  {
    title: 'Community',
    items: [
      {
        path: '/announcements',
        label: 'Announcements',
        icon: Megaphone,
      },
      {
        path: '/discussions',
        label: 'Discussions',
        icon: MessageSquare,
      },
      {
        path: '/communication-hub',
        label: 'Communication Hub',
        icon: MessageCircle,
      },
    ],
  },
  {
    title: 'Services',
    items: [
      {
        path: '/facilities',
        label: 'Facilities',
        icon: Building,
      },
      {
        path: '/marketplace',
        label: 'Marketplace',
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        path: '/cctv-live-feed',
        label: 'CCTV Live Feed',
        icon: Video,
        isAdminOnly: true,
      },
      {
        path: '/visitor-security',
        label: 'Visitor Security',
        icon: Shield,
        isAdminOnly: true,
      },
      {
        path: '/visitor-analytics',
        label: 'Visitor Analytics',
        icon: BarChart,
        isAdminOnly: true,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        path: '/role-management',
        label: 'Role Management',
        icon: Users,
      },
      {
        path: '/admin',
        label: 'Admin Panel',
        icon: Settings,
        badge: 'Admin',
        isAdminOnly: true,
      },
    ],
  },
];

export function EnhancedNavigation({ className }: { className?: string }) {
  const location = useLocation();
  const { user } = useSimpleAuth();

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = location.pathname === item.path;
    const IconComponent = item.icon;

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <IconComponent className="h-4 w-4" />
        <span>{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <nav className={cn('space-y-6', className)}>
      {navigationSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <div className="mx-2 px-3 py-2 bg-muted/50 rounded-md border border-border/50">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {section.title}
            </h3>
          </div>
          <div className="space-y-1">
            {section.items.map(renderNavigationItem)}
          </div>
        </div>
      ))}
    </nav>
  );
}