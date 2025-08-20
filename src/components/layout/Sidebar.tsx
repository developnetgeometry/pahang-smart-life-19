import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { NavLink, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard, Calendar, Users, MessageSquare, Building, ShoppingCart,
  Camera, Shield, Settings, UserPlus, Wrench, AlertTriangle, Monitor,
  Radio, Megaphone, FileText, Home, Activity, User, Bell, CreditCard,
  MapPin, Building2, Key, UserCheck, Package, Archive, CheckCircle,
  Briefcase, Clock, History, Receipt, BarChart3, TrendingUp, DollarSign,
  Search
} from 'lucide-react';

interface SystemModule {
  id: string;
  module_name: string;
  display_name: string;
  description: string;
  category: string;
  icon_name?: string;
  route_path?: string;
  sort_order?: number;
  is_active: boolean;
}

interface NavigationGroup {
  label: string;
  items: SystemModule[];
}

const iconMap: { [key: string]: any } = {
  Home, User, Bell, MessageSquare, Calendar, AlertTriangle, Users, ShoppingCart,
  CreditCard, FileText, MapPin, Building2, Building, Shield, Camera, Key,
  UserCheck, Wrench, Package, Archive, CheckCircle, Briefcase, Clock, History,
  Receipt, BarChart3, TrendingUp, DollarSign, Settings, LayoutDashboard,
  Monitor, Radio, Megaphone, Activity, UserPlus
};

const categoryLabels = {
  core: 'Core Features',
  resident: 'My Services',
  management: 'Management Tools',
  security: 'Security Operations',
  maintenance: 'Maintenance & Assets',
  service: 'Service Provider',
  analytics: 'Analytics & Reports',
  admin: 'System Administration'
};

const categoryRoleMap = {
  core: ['resident', 'admin', 'manager', 'security_officer', 'maintenance_staff', 'service_provider', 'community_leader', 'community_admin', 'district_coordinator', 'state_admin', 'state_service_manager', 'facility_manager'],
  resident: ['resident', 'admin', 'manager', 'community_leader', 'community_admin', 'district_coordinator', 'state_admin'],
  management: ['admin', 'manager', 'community_admin', 'district_coordinator', 'state_admin', 'facility_manager'],
  security: ['security_officer', 'admin', 'manager'],
  maintenance: ['maintenance_staff', 'admin', 'manager', 'facility_manager'],
  service: ['service_provider', 'admin', 'manager', 'state_service_manager'],
  analytics: ['admin', 'manager', 'district_coordinator', 'state_admin'],
  admin: ['admin', 'state_admin']
};

export function AppSidebar() {
  const { language, hasRole, user } = useAuth();
  const { t } = useTranslation(language);
  const location = useLocation();
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, [user]);

  const fetchModules = async () => {
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

  const canAccessModule = (module: SystemModule) => {
    const requiredRoles = categoryRoleMap[module.category as keyof typeof categoryRoleMap] || [];
    return requiredRoles.some(role => hasRole?.(role as any));
  };

  const getNavigationForUser = () => {
    const filteredModules = modules.filter(canAccessModule);
    
    // Group modules by category
    const modulesByCategory = filteredModules.reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    }, {} as Record<string, SystemModule[]>);

    // Convert to navigation groups
    const nav: NavigationGroup[] = [];
    Object.entries(modulesByCategory).forEach(([category, categoryModules]) => {
      if (categoryModules.length > 0) {
        nav.push({
          label: categoryLabels[category as keyof typeof categoryLabels] || category,
          items: categoryModules.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        });
      }
    });

    return nav;
  };

  const navigation = loading ? [] : getNavigationForUser();

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
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
          ) : (
            navigation.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground px-3 py-2">
                  {group.label}
                </h4>
                <div className="space-y-1">
                  {group.items.map((module) => {
                    const IconComponent = iconMap[module.icon_name || 'Home'] || Home;
                    const route = module.route_path || '/';
                    
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
                {groupIndex < navigation.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}