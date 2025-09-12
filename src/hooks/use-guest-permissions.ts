import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GuestPermission {
  feature_name: string;
  is_enabled: boolean;
}

export function useGuestPermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<GuestPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        // Get user's community
        const { data: profile } = await supabase
          .from('profiles')
          .select('community_id')
          .eq('id', user.id)
          .single();

        if (!profile?.community_id) {
          setPermissions([]);
          setLoading(false);
          return;
        }

        // Get guest permissions for the community
        const { data, error } = await supabase
          .rpc('get_guest_permissions_for_community', {
            p_community_id: profile.community_id
          });

        if (error) throw error;

        setPermissions(data || []);
      } catch (error) {
        console.error('Error fetching guest permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const hasFeaturePermission = (featureName: string): boolean => {
    const permission = permissions.find(p => p.feature_name === featureName);
    return permission?.is_enabled || false;
  };

  return {
    permissions,
    loading,
    hasFeaturePermission
  };
}