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
    const category = module.category;
    const moduleName = module.module_name;
    
    console.log(`Checking access for module: ${module.display_name}, category: ${category}, user roles:`, user);
    
    // Role-based access control with detailed permissions
    switch (category) {
      case 'admin':
        const hasAdminAccess = hasRole('admin') || hasRole('state_admin');
        console.log(`Admin module ${module.display_name}: hasAdminAccess = ${hasAdminAccess}`);
        return hasAdminAccess;
        
      case 'security':
        const hasSecurityAccess = hasRole('security_officer') || hasRole('admin') || hasRole('state_admin') || hasRole('district_coordinator');
        console.log(`Security module ${module.display_name}: hasSecurityAccess = ${hasSecurityAccess}`);
        return hasSecurityAccess;
        
      case 'maintenance':
        const hasMaintenanceAccess = hasRole('maintenance_staff') || hasRole('facility_manager') || hasRole('admin') || hasRole('state_admin') || hasRole('district_coordinator');
        console.log(`Maintenance module ${module.display_name}: hasMaintenanceAccess = ${hasMaintenanceAccess}`);
        return hasMaintenanceAccess;
        
      case 'service':
        const hasServiceAccess = hasRole('service_provider') || hasRole('admin') || hasRole('state_admin');
        console.log(`Service module ${module.display_name}: hasServiceAccess = ${hasServiceAccess}`);
        return hasServiceAccess;
        
      case 'analytics':
        const hasAnalyticsAccess = hasRole('admin') || hasRole('state_admin') || hasRole('district_coordinator') || hasRole('community_admin');
        console.log(`Analytics module ${module.display_name}: hasAnalyticsAccess = ${hasAnalyticsAccess}`);
        return hasAnalyticsAccess;
        
      case 'management':
        const hasManagementAccess = hasRole('admin') || hasRole('state_admin') || hasRole('district_coordinator') || hasRole('community_admin') || hasRole('facility_manager');
        console.log(`Management module ${module.display_name}: hasManagementAccess = ${hasManagementAccess}`);
        return hasManagementAccess;
        
      case 'core':
        // Core modules accessible to all authenticated users
        console.log(`Core module ${module.display_name}: allowing access`);
        return true;
        
      case 'resident':
        // Resident services accessible to all users
        console.log(`Resident module ${module.display_name}: allowing access`);
        return true;
        
      default:
        // Default to resident access for uncategorized modules
        console.log(`Uncategorized module ${module.display_name}: allowing access by default`);
        return true;
    }
  };

  const filteredModules = modules.filter(canAccessModule);
  
  // Group modules by category with proper role-based sections
  const getModuleSections = () => {
    const sections: { title: string; modules: SystemModule[]; priority: number }[] = [];
    
    // Core section - always first
    const coreModules = filteredModules.filter(m => m.category === 'core');
    if (coreModules.length > 0) {
      sections.push({
        title: language === 'en' ? 'Core Features' : 'Ciri Utama',
        modules: coreModules,
        priority: 1
      });
    }
    
    // Resident Services - for all users
    const residentModules = filteredModules.filter(m => m.category === 'resident');
    if (residentModules.length > 0) {
      sections.push({
        title: language === 'en' ? 'My Services' : 'Perkhidmatan Saya',
        modules: residentModules,
        priority: 2
      });
    }
    
    // Management section - for management roles
    const managementModules = filteredModules.filter(m => m.category === 'management');
    if (managementModules.length > 0) {
      sections.push({
        title: language === 'en' ? 'Management' : 'Pengurusan',
        modules: managementModules,
        priority: 3
      });
    }
    
    // Security section - for security roles
    const securityModules = filteredModules.filter(m => m.category === 'security');
    if (securityModules.length > 0) {
      sections.push({
        title: language === 'en' ? 'Security & Monitoring' : 'Keselamatan & Pemantauan',
        modules: securityModules,
        priority: 4
      });
    }
    
    // Maintenance section - for maintenance roles
    const maintenanceModules = filteredModules.filter(m => m.category === 'maintenance');
    if (maintenanceModules.length > 0) {
      sections.push({
        title: language === 'en' ? 'Maintenance & Assets' : 'Penyelenggaraan & Aset',
        modules: maintenanceModules,
        priority: 5
      });
    }
    
    // Service Provider section - for service providers
    const serviceModules = filteredModules.filter(m => m.category === 'service');
    if (serviceModules.length > 0) {
      sections.push({
        title: language === 'en' ? 'Service Operations' : 'Operasi Perkhidmatan',
        modules: serviceModules,
        priority: 6
      });
    }
    
    // Analytics section - for analytics roles
    const analyticsModules = filteredModules.filter(m => m.category === 'analytics');
    if (analyticsModules.length > 0) {
      sections.push({
        title: language === 'en' ? 'Analytics & Reports' : 'Analitik & Laporan',
        modules: analyticsModules,
        priority: 7
      });
    }
    
    // Administration section - for admin roles
    const adminModules = filteredModules.filter(m => m.category === 'admin');
    if (adminModules.length > 0) {
      sections.push({
        title: language === 'en' ? 'System Administration' : 'Pentadbiran Sistem',
        modules: adminModules,
        priority: 8
      });
    }
    
    return sections.sort((a, b) => a.priority - b.priority);
  };

  const moduleSections = getModuleSections();

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
          {moduleSections.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground px-3 py-2 uppercase tracking-wider">
                {section.title}
                <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                  {section.modules.length}
                </span>
              </h4>
              <div className="space-y-1">
                {section.modules.map((module) => {
                  const IconComponent = iconMap[module.icon_name || 'FileText'] || FileText;
                  const route = getModuleRoute(module);
                  
                  return (
                    <NavLink
                      key={module.id}
                      to={route}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{module.display_name}</span>
                    </NavLink>
                  );
                })}
              </div>
              {sectionIndex < moduleSections.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
          
          {/* Show user role info at bottom */}
          {user && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="px-3 py-2">
                <div className="text-xs text-muted-foreground mb-2">Current User:</div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {user.display_name}
                  </span>
                  {user.user_role && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {user.user_role.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}