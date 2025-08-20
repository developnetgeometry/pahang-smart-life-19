import { Link, useLocation } from 'react-router-dom';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { PermissionWrapper } from '@/components/auth/PermissionWrapper';
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
  module: string;
  permission: 'read' | 'create' | 'update' | 'delete' | 'approve';
  badge?: string;
  requiredLevel?: number;
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
        module: 'dashboard',
        permission: 'read',
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
        module: 'my_bookings',
        permission: 'read',
      },
      {
        path: '/my-complaints',
        label: 'My Complaints',
        icon: FileText,
        module: 'complaints',
        permission: 'read',
      },
      {
        path: '/my-visitors',
        label: 'My Visitors',
        icon: UserCheck,
        module: 'visitors',
        permission: 'read',
      },
      {
        path: '/my-profile',
        label: 'My Profile',
        icon: User,
        module: 'profile',
        permission: 'read',
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
        module: 'announcements',
        permission: 'read',
      },
      {
        path: '/discussions',
        label: 'Discussions',
        icon: MessageSquare,
        module: 'discussions',
        permission: 'read',
      },
      {
        path: '/communication-hub',
        label: 'Communication Hub',
        icon: MessageCircle,
        module: 'communication',
        permission: 'read',
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
        module: 'facilities',
        permission: 'read',
      },
      {
        path: '/marketplace',
        label: 'Marketplace',
        icon: ShoppingCart,
        module: 'marketplace',
        permission: 'read',
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
        module: 'cctv',
        permission: 'read',
        requiredLevel: 6,
      },
      {
        path: '/visitor-security',
        label: 'Visitor Security',
        icon: Shield,
        module: 'visitor_security',
        permission: 'read',
        requiredLevel: 6,
      },
      {
        path: '/visitor-analytics',
        label: 'Visitor Analytics',
        icon: BarChart,
        module: 'visitor_analytics',
        permission: 'read',
        requiredLevel: 6,
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
        module: 'role_management',
        permission: 'read',
      },
      {
        path: '/admin',
        label: 'Admin Panel',
        icon: Settings,
        module: 'admin_panel',
        permission: 'read',
        requiredLevel: 8,
        badge: 'Admin',
      },
    ],
  },
];

export function EnhancedNavigation({ className }: { className?: string }) {
  const location = useLocation();
  const { hasRoleLevel, roleInfo } = useEnhancedAuth();

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = location.pathname === item.path;
    const IconComponent = item.icon;

    // Check role level if required
    if (item.requiredLevel && !hasRoleLevel(item.requiredLevel)) {
      return null;
    }

    return (
      <PermissionWrapper
        key={item.path}
        module={item.module}
        permission={item.permission}
      >
        <Link
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
          {roleInfo && roleInfo.level >= 8 && item.path === '/admin' && (
            <Badge 
              variant="outline" 
              className="ml-auto text-xs"
              style={{ 
                backgroundColor: roleInfo.color_code + '20',
                borderColor: roleInfo.color_code,
                color: roleInfo.color_code 
              }}
            >
              L{roleInfo.level}
            </Badge>
          )}
        </Link>
      </PermissionWrapper>
    );
  };

  return (
    <nav className={cn('space-y-6', className)}>
      {navigationSections.map((section) => {
        // Filter out items that the user doesn't have access to
        const visibleItems = section.items.filter((item) => {
          if (item.requiredLevel && !hasRoleLevel(item.requiredLevel)) {
            return false;
          }
          return true;
        });

        // Don't render the section if no items are visible
        if (visibleItems.length === 0) {
          return null;
        }

        return (
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
        );
      })}
    </nav>
  );
}