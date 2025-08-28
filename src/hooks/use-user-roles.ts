import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type EnhancedUserRole = 
  | 'resident'
  | 'community_leader' 
  | 'service_provider'
  | 'maintenance_staff'
  | 'security_officer'
  | 'community_admin'
  | 'district_coordinator'
  | 'state_admin'
  | 'state_service_manager'
  | 'spouse'
  | 'tenant';

export function useUserRoles() {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<EnhancedUserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setUserRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('enhanced_user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) throw error;

        const roles = data?.map(item => item.role as EnhancedUserRole) || [];
        setUserRoles(roles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: EnhancedUserRole): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: EnhancedUserRole[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  return {
    userRoles,
    loading,
    hasRole,
    hasAnyRole
  };
}