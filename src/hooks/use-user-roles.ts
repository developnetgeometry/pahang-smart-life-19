import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type EnhancedUserRole = 
  | 'resident'
  | 'community_leader' 
  | 'service_provider'
  | 'maintenance_staff'
  | 'facility_manager'
  | 'security_officer'
  | 'community_admin'
  | 'district_coordinator'
  | 'state_admin'
  | 'state_service_manager'
  | 'spouse'
  | 'tenant'
  | 'guest';

export function useUserRoles() {
  const { user, roles } = useAuth();
  const [userRoles, setUserRoles] = useState<EnhancedUserRole[]>([]);
  const [loading, setLoading] = useState(false);

  // Use roles from AuthContext when available to avoid duplicate DB calls
  useEffect(() => {
    if (!user) {
      setUserRoles([]);
      setLoading(false);
      return;
    }

    // If roles are already loaded in AuthContext, use them
    if (roles && roles.length > 0) {
      setUserRoles(roles as EnhancedUserRole[]);
      setLoading(false);
      return;
    }

    // Fallback: fetch roles if not available in context
    const fetchUserRoles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('enhanced_user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) throw error;

        const fetchedRoles = data?.map(item => item.role as EnhancedUserRole) || [];
        setUserRoles(fetchedRoles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user, roles]);

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