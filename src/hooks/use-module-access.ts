import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EnabledModule {
  module_name: string;
  display_name: string;
  category: string;
}

export function useModuleAccess() {
  const { user } = useAuth();
  const [enabledModules, setEnabledModules] = useState<EnabledModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnabledModules = async () => {
      if (!user) {
        setEnabledModules([]);
        setLoading(false);
        return;
      }

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

        // Get enabled modules for the user's community
        const { data, error } = await supabase
          .from('community_features')
          .select('module_name')
          .eq('community_id', profile.community_id)
          .eq('is_enabled', true);
        
        if (error) {
          console.error('Error fetching enabled modules:', error);
          setEnabledModules([]);
        } else {
          // Transform to match the expected interface
          const modules: EnabledModule[] = (data || []).map(item => {
            // Map module names to display names and categories
            const moduleInfo = getModuleInfo(item.module_name);
            return {
              module_name: item.module_name,
              display_name: moduleInfo.display_name,
              category: moduleInfo.category
            };
          });
          
          console.log('Enabled modules for user:', modules);
          setEnabledModules(modules);
        }
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
  }, [user]);

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
    'announcements': { display_name: 'Announcements', category: 'communication' },
    'directory': { display_name: 'Community Directory', category: 'information' },
    'complaints': { display_name: 'Complaints Management', category: 'services' },
    'discussions': { display_name: 'Community Discussions', category: 'communication' },
    'events': { display_name: 'Events & Activities', category: 'community' },
    'bookings': { display_name: 'Facility Bookings', category: 'community' },
    'marketplace': { display_name: 'Marketplace', category: 'community' },
    'facilities': { display_name: 'Facilities Management', category: 'community' },
    'service_requests': { display_name: 'Service Requests', category: 'services' },
    'visitor_management': { display_name: 'Visitor Management', category: 'security' },
    'cctv': { display_name: 'CCTV Monitoring', category: 'security' }
  };

  return moduleMap[moduleName] || { 
    display_name: moduleName, 
    category: 'other' 
  };
}