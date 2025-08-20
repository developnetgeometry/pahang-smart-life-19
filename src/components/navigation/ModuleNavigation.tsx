import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, User, Bell, MessageSquare, Calendar, AlertTriangle, Users, ShoppingBag, 
  CreditCard, FileText, MapPin, Building2, Building, Shield, Video, Key, 
  UserCheck, Wrench, Package, Archive, CheckCircle, Briefcase, Clock, History, 
  Receipt, BarChart3, TrendingUp, DollarSign, Settings, Search
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
  created_at: string;
  updated_at?: string;
}

const iconMap: { [key: string]: any } = {
  Home, User, Bell, MessageSquare, Calendar, AlertTriangle, Users, ShoppingBag,
  CreditCard, FileText, MapPin, Building2, Building, Shield, Video, Key,
  UserCheck, Wrench, Package, Archive, CheckCircle, Briefcase, Clock, History,
  Receipt, BarChart3, TrendingUp, DollarSign, Settings
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

export function ModuleNavigation() {
  const { user, language } = useAuth();
  const location = useLocation();
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const modulesByCategory = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, SystemModule[]>);

  const getModuleRoute = (moduleName: string) => {
    const routeMap: { [key: string]: string } = {
      'dashboard': '/',
      'profile': '/profile',
      'notifications': '/notifications',
      'communication': '/communication',
      'my-bookings': '/my-bookings',
      'my-complaints': '/my-complaints',
      'my-visitors': '/my-visitors',
      'community-events': '/events',
      'marketplace': '/marketplace',
      'my-payments': '/my-payments',
      'documents': '/documents',
      'user-management': '/admin/users',
      'district-management': '/admin/districts',
      'community-management': '/admin/communities',
      'facility-management': '/admin/facilities',
      'event-management': '/admin/events',
      'security-dashboard': '/security/dashboard',
      'cctv-management': '/security/cctv',
      'access-control': '/security/access',
      'incident-reports': '/security/incidents',
      'visitor-security': '/security/visitors',
      'work-orders': '/maintenance/work-orders',
      'asset-management': '/maintenance/assets',
      'inventory-management': '/maintenance/inventory',
      'quality-inspections': '/maintenance/inspections',
      'service-dashboard': '/service/dashboard',
      'appointments': '/service/appointments',
      'customer-management': '/service/customers',
      'billing-invoicing': '/service/billing',
      'analytics-reports': '/analytics/reports',
      'performance-metrics': '/analytics/metrics',
      'system-settings': '/admin/settings',
      'audit-logs': '/admin/audit'
    };
    return routeMap[moduleName] || '/';
  };

  const isCurrentRoute = (moduleName: string) => {
    const route = getModuleRoute(moduleName);
    return location.pathname === route;
  };

  if (loading) {
    return <div className="p-6">Loading modules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'en' ? 'System Modules' : 'Modul Sistem'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Access all available system features' : 'Akses semua ciri sistem yang tersedia'}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'en' ? 'Search modules...' : 'Cari modul...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="core">Core</TabsTrigger>
          <TabsTrigger value="resident">Resident</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {selectedCategory === 'all' ? (
            <div className="space-y-8">
              {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
                <div key={category}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    {categoryLabels[category as keyof typeof categoryLabels] || category}
                    <Badge variant="secondary">{categoryModules.length}</Badge>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryModules.map((module) => {
                      const IconComponent = iconMap[module.icon_name] || Home;
                      const isActive = isCurrentRoute(module.module_name);
                      
                      return (
                        <Card key={module.id} className={`hover:shadow-md transition-all cursor-pointer ${isActive ? 'ring-2 ring-primary' : ''}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <IconComponent className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                              {isActive && <Badge variant="default">Active</Badge>}
                            </div>
                            <CardTitle className="text-base">{module.display_name}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-sm mb-4">
                              {module.description}
                            </CardDescription>
                            <NavLink to={getModuleRoute(module.module_name)}>
                              <Button 
                                variant={isActive ? "default" : "outline"} 
                                size="sm" 
                                className="w-full"
                              >
                                {language === 'en' ? 'Open Module' : 'Buka Modul'}
                              </Button>
                            </NavLink>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredModules.map((module) => {
                const IconComponent = iconMap[module.icon_name] || Home;
                const isActive = isCurrentRoute(module.module_name);
                
                return (
                  <Card key={module.id} className={`hover:shadow-md transition-all cursor-pointer ${isActive ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <IconComponent className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        {isActive && <Badge variant="default">Active</Badge>}
                      </div>
                      <CardTitle className="text-base">{module.display_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm mb-4">
                        {module.description}
                      </CardDescription>
                      <NavLink to={getModuleRoute(module.module_name)}>
                        <Button 
                          variant={isActive ? "default" : "outline"} 
                          size="sm" 
                          className="w-full"
                        >
                          {language === 'en' ? 'Open Module' : 'Buka Modul'}
                        </Button>
                      </NavLink>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}