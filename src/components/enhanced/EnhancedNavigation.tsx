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

const navigationItems: NavigationItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: Home,
    module: 'dashboard',
    permission: 'read',
  },
  {
    path: '/announcements',
    label: 'Announcements',
    icon: Megaphone,
    module: 'announcements',
    permission: 'read',
  },
  {
    path: '/facilities',
    label: 'Facilities',
    icon: Building,
    module: 'facilities',
    permission: 'read',
  },
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
    path: '/discussions',
    label: 'Discussions',
    icon: MessageSquare,
    module: 'discussions',
    permission: 'read',
  },
  {
    path: '/marketplace',
    label: 'Marketplace',
    icon: ShoppingCart,
    module: 'marketplace',
    permission: 'read',
  },
  {
    path: '/cctv-live-feed',
    label: 'CCTV Live Feed',
    icon: Video,
    module: 'cctv',
    permission: 'read',
    requiredLevel: 6,
  },
  {
    path: '/my-visitors',
    label: 'My Visitors',
    icon: UserCheck,
    module: 'visitors',
    permission: 'read',
  },
  {
    path: '/communication-hub',
    label: 'Communication Hub',
    icon: MessageCircle,
    module: 'communication',
    permission: 'read',
  },
  {
    path: '/visitor-analytics',
    label: 'Visitor Analytics',
    icon: BarChart,
    module: 'visitor_analytics',
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
  {
    path: '/my-profile',
    label: 'My Profile',
    icon: Settings,
    module: 'profile',
    permission: 'read',
  },
];

export function EnhancedNavigation({ className }: { className?: string }) {
  const location = useLocation();
  const { hasRoleLevel, roleInfo } = useEnhancedAuth();

  return (
    <nav className={cn('space-y-2', className)}>
      {navigationItems.map((item) => {
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
      })}
    </nav>
  );
}