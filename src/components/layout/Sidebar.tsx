import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
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
  BarChart3,
  Bell,
  CreditCard,
  Briefcase,
  Activity,
  Grid3X3,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface SystemModule {
  id: string;
  module_name: string;
  display_name: string;
  description: string;
  category: string;
  icon_name?: string;
  sort_order?: number;
  is_active: boolean;
  route_path?: string;
}

const iconMap: { [key: string]: any } = {
  Home: LayoutDashboard,
  User: Users,
  Bell: Bell,
  MessageSquare: MessageSquare,
  Calendar: Calendar,
  AlertTriangle: AlertTriangle,
  Users: Users,
  ShoppingBag: ShoppingCart,
  CreditCard: CreditCard,
  FileText: FileText,
  MapPin: Home,
  Building2: Building,
  Building: Building,
  Shield: Shield,
  Video: Camera,
  Key: Settings,
  UserCheck: UserPlus,
  Wrench: Wrench,
  Package: Building,
  Archive: FileText,
  CheckCircle: Shield,
  Briefcase: Briefcase,
  Clock: Calendar,
  History: Calendar,
  Receipt: CreditCard,
  BarChart3: BarChart3,
  TrendingUp: TrendingUp,
  DollarSign: DollarSign,
  Settings: Settings,
  Activity: Activity,
  Grid3X3: Grid3X3
};

const categoryLabels = {
  core: 'Core Features',
  resident: 'Resident Services',
  management: 'Management Tools',
  security: 'Security Operations',
  maintenance: 'Maintenance & Assets',
  service: 'Service Provider',
  analytics: 'Analytics & Reports',
  admin: 'System Administration'
};

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
  const { language, hasRole, user } = useAuth();
  const { t } = useTranslation(language);
  const location = useLocation();
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserModules();
  }, [user]);

  const fetchUserModules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('system_modules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleRoute = (module: SystemModule) => {
    return module.route_path || `/${module.module_name.replace('_', '-')}`;
  };

  const canAccessModule = (module: SystemModule) => {
    // Basic role-based access control
    const category = module.category;
    
    switch (category) {
      case 'admin':
        return hasRole('admin') || hasRole('state_admin');
      case 'security':
        return hasRole('security_officer') || hasRole('admin') || hasRole('manager');
      case 'maintenance':
        return hasRole('maintenance_staff') || hasRole('facility_manager') || hasRole('admin') || hasRole('manager');
      case 'service':
        return hasRole('service_provider') || hasRole('admin') || hasRole('manager');
      case 'analytics':
        return hasRole('admin') || hasRole('manager') || hasRole('state_admin');
      case 'management':
        return hasRole('admin') || hasRole('manager') || hasRole('community_admin') || hasRole('district_coordinator');
      case 'core':
      case 'resident':
      default:
        return true; // Core and resident modules accessible to all
    }
  };

  const filteredModules = modules.filter(canAccessModule);
  
  const modulesByCategory = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, SystemModule[]>);

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col bg-card border-r border-border">
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading modules...</div>
        </div>
      </div>
    );
  }

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
          {Object.entries(modulesByCategory).map(([category, categoryModules], groupIndex) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground px-3 py-2">
                {categoryLabels[category as keyof typeof categoryLabels] || category}
              </h4>
              <div className="space-y-1">
                {categoryModules.map((module) => {
                  const IconComponent = iconMap[module.icon_name || 'FileText'] || FileText;
                  const route = getModuleRoute(module);
                  
                  return (
                    <NavLink
                      key={module.id}
                      to={route}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{module.display_name}</span>
                    </NavLink>
                  );
                })}
              </div>
              {groupIndex < Object.entries(modulesByCategory).length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}