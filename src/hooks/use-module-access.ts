import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EnabledModule {
  module_name: string;
  display_name: string;
  category: string;
}

export function useModuleAccess() {
  const { user, hasRole } = useAuth();
  const [enabledModules, setEnabledModules] = useState<EnabledModule[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('useModuleAccess: user:', user?.id, 'hasRole function available:', typeof hasRole);

  useEffect(() => {
    const fetchEnabledModules = async () => {
      if (!user) {
        console.log('No user logged in - setting empty modules');
        setEnabledModules([]);
        setLoading(false);
        return;
      }

      console.log('Fetching modules for user:', user.id, 'with roles:', hasRole);

      try {
        // Get user's community first
        const { data: profile } = await supabase
          .from('profiles')
          .select('community_id')
          .eq('id', user.id)
          .single();

        if (!profile?.community_id) {
          console.log('User has no community assigned');
          setEnabledModules([]);
          setLoading(false);
          return;
        }

        // Get community-controlled modules
        const { data: communityModules, error } = await supabase
          .from('community_features')
          .select('module_name')
          .eq('community_id', profile.community_id)
          .eq('is_enabled', true);
        
        if (error) {
          console.error('Error fetching community modules:', error);
        }

        // Define role-based modules that are NOT controlled by community admin
        const roleBasedModules: string[] = [];
        
        // Facility manager gets these modules regardless of community settings
        if (hasRole('facility_manager')) {
          console.log('User has facility_manager role, adding role-based modules');
          roleBasedModules.push('facilities', 'bookings', 'maintenance', 'assets');
        } else {
          console.log('User does not have facility_manager role');
        }
        
        // Security officer gets these modules regardless of community settings
        if (hasRole('security_officer')) {
          roleBasedModules.push('cctv', 'visitor_management', 'security');
        }
        
        // Maintenance staff gets these modules regardless of community settings
        if (hasRole('maintenance_staff')) {
          roleBasedModules.push('maintenance', 'assets');
        }

        // Combine community-controlled and role-based modules
        const allModuleNames = [
          ...(communityModules?.map(m => m.module_name) || []),
          ...roleBasedModules
        ];

        // Remove duplicates
        const uniqueModuleNames = [...new Set(allModuleNames)];

        // Transform to match the expected interface
        const modules: EnabledModule[] = uniqueModuleNames.map(moduleName => {
          const moduleInfo = getModuleInfo(moduleName);
          return {
            module_name: moduleName,
            display_name: moduleInfo.display_name,
            category: moduleInfo.category
          };
        });
        
        console.log('Enabled modules for user:', modules);
        setEnabledModules(modules);
      } catch (error) {
        console.error('Error fetching enabled modules:', error);
        setEnabledModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnabledModules();

    // Set up real-time subscription to community_features changes
    let channel: any = null;
    
    if (user) {
      channel = supabase
        .channel('community-features-changes')
        .on('postgres_changes', {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'community_features'
        }, (payload) => {
          console.log('Community features changed:', payload);
          // Refetch modules when changes occur
          fetchEnabledModules();
        })
        .subscribe();
    }

    // Cleanup subscription
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, hasRole]);

  const isModuleEnabled = (moduleName: string): boolean => {
    return enabledModules.some(module => module.module_name === moduleName);
  };

  const getModulesByCategory = (category: string): EnabledModule[] => {
    return enabledModules.filter(module => module.category === category);
  };

  return {
    enabledModules,
    loading,
    isModuleEnabled,
    getModulesByCategory
  };
}

// Helper function to get module information
function getModuleInfo(moduleName: string) {
  const moduleMap: Record<string, { display_name: string; category: string }> = {
    // Community-controlled modules (managed by community admin)
    'announcements': { display_name: 'Announcements', category: 'communication' },
    'directory': { display_name: 'Community Directory', category: 'information' },
    'complaints': { display_name: 'Complaints Management', category: 'services' },
    'discussions': { display_name: 'Community Discussions', category: 'communication' },
    'events': { display_name: 'Events & Activities', category: 'community' },
    'marketplace': { display_name: 'Marketplace', category: 'community' },
    'service_requests': { display_name: 'Service Requests', category: 'services' },
    
    // Role-based modules (NOT controlled by community admin)
    'facilities': { display_name: 'Facilities Management', category: 'facilities' },
    'bookings': { display_name: 'Facility Bookings', category: 'facilities' },
    'maintenance': { display_name: 'Maintenance Management', category: 'facilities' },
    'assets': { display_name: 'Asset Management', category: 'facilities' },
    'cctv': { display_name: 'CCTV Monitoring', category: 'security' },
    'visitor_management': { display_name: 'Visitor Management', category: 'security' },
    'security': { display_name: 'Security Management', category: 'security' }
  };

  return moduleMap[moduleName] || { 
    display_name: moduleName, 
    category: 'other' 
  };
}