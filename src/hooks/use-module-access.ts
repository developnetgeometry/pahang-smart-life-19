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
        const { data, error } = await supabase.rpc('get_enabled_modules_for_user_by_role');
        
        if (error) {
          console.error('Error fetching enabled modules:', error);
          setEnabledModules([]);
        } else {
          setEnabledModules(data || []);
        }
      } catch (error) {
        console.error('Error fetching enabled modules:', error);
        setEnabledModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnabledModules();
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