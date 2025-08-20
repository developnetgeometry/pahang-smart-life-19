import { Link, useLocation } from 'react-router-dom';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
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
  module?: string;
  requiredPermission?: string;
  requiredRoleLevel?: number;
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
        requiredPermission: 'read',
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
        requiredPermission: 'read',
      },
      {
        path: '/my-complaints',
        label: 'My Complaints',
        icon: FileText,
        module: 'complaints',
        requiredPermission: 'read',
      },
      {
        path: '/my-visitors',
        label: 'My Visitors',
        icon: UserCheck,
        module: 'visitors',
        requiredPermission: 'read',
      },
      {
        path: '/my-profile',
        label: 'My Profile',
        icon: User,
        module: 'profile',
        requiredPermission: 'read',
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
        requiredPermission: 'read',
      },
      {
        path: '/discussions',
        label: 'Discussions',
        icon: MessageSquare,
        module: 'discussions',
        requiredPermission: 'read',
      },
      {
        path: '/communication-hub',
        label: 'Communication Hub',
        icon: MessageCircle,
        module: 'communication',
        requiredPermission: 'read',
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
        requiredPermission: 'read',
      },
      {
        path: '/marketplace',
        label: 'Marketplace',
        icon: ShoppingCart,
        module: 'marketplace',
        requiredPermission: 'read',
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
        requiredPermission: 'read',
        requiredRoleLevel: 5,
      },
      {
        path: '/visitor-security',
        label: 'Visitor Security',
        icon: Shield,
        module: 'visitor_security',
        requiredPermission: 'read',
        requiredRoleLevel: 4,
      },
      {
        path: '/visitor-analytics',
        label: 'Visitor Analytics',
        icon: BarChart,
        module: 'analytics',
        requiredPermission: 'read',
        requiredRoleLevel: 5,
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
        requiredPermission: 'read',
        requiredRoleLevel: 3,
      },
      {
        path: '/admin',
        label: 'Admin Panel',
        icon: Settings,
        badge: 'Admin',
        module: 'admin',
        requiredPermission: 'read',
        requiredRoleLevel: 6,
      },
    ],
  },
];

export function EnhancedNavigation({ className }: { className?: string }) {
  const location = useLocation();
  const { user, hasRoleLevel, hasModulePermission } = useEnhancedAuth();
  const [allowedItems, setAllowedItems] = useState<Record<string, boolean>>({});
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Check permissions for all navigation items
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setIsLoadingPermissions(false);
        return;
      }

      const permissionChecks: Record<string, boolean> = {};
      
      for (const section of navigationSections) {
        for (const item of section.items) {
          const key = item.path;
          
          // Check role level requirement
          if (item.requiredRoleLevel && !hasRoleLevel(item.requiredRoleLevel)) {
            permissionChecks[key] = false;
            continue;
          }
          
          // Check module permission
          if (item.module && item.requiredPermission) {
            try {
              const hasPermission = await hasModulePermission(item.module, item.requiredPermission);
              permissionChecks[key] = hasPermission;
            } catch (error) {
              console.error(`Permission check failed for ${item.module}:`, error);
              permissionChecks[key] = false;
            }
          } else {
            // If no specific permissions required, allow access
            permissionChecks[key] = true;
          }
        }
      }
      
      setAllowedItems(permissionChecks);
      setIsLoadingPermissions(false);
    };

    checkPermissions();
  }, [user, hasRoleLevel, hasModulePermission]);

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

  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <nav className={cn('space-y-6', className)}>
      {navigationSections.map((section) => {
        // Filter items based on permissions
        const allowedSectionItems = section.items.filter(item => allowedItems[item.path]);
        
        // Only show section if it has allowed items
        if (allowedSectionItems.length === 0) {
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
              {allowedSectionItems.map(renderNavigationItem)}
            </div>
          </div>
        );
      })}
    </nav>
  );
}