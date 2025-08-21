import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedUserRole } from '@/hooks/use-user-roles';

interface AccessLevel {
  level: number;
  canAccessLevel: (targetLevel: number) => boolean;
  canManageUsers: boolean;
  canViewFinancials: boolean;
  canManageFacilities: boolean;
  canAccessSecurity: boolean;
  canManageDistrict: boolean;
  canAccessState: boolean;
}

interface GeographicScope {
  type: 'community' | 'district' | 'state' | 'none';
  districtId?: string;
  communityId?: string;
}

interface FunctionalAccess {
  security: boolean;
  facilities: boolean;
  services: boolean;
  administration: boolean;
  maintenance: boolean;
  community: boolean;
}

export function useAccessControl() {
  const { user } = useAuth();
  const { userRoles, hasRole, loading } = useUserRoles();
  const [userLevel, setUserLevel] = useState<number>(0);
  const [geographicScope, setGeographicScope] = useState<GeographicScope>({ type: 'none' });
  const [functionalAccess, setFunctionalAccess] = useState<FunctionalAccess>({
    security: false,
    facilities: false,
    services: false,
    administration: false,
    maintenance: false,
    community: false
  });

  // Role hierarchy levels (matching the database)
  const roleHierarchy: Record<EnhancedUserRole, number> = {
    'resident': 1,
    'state_service_manager': 2,
    'community_leader': 3,
    'service_provider': 4,
    'maintenance_staff': 5,
    'security_officer': 6,
    'facility_manager': 7,
    'community_admin': 8,
    'district_coordinator': 9,
    'state_admin': 10
  };

  // Geographic scope mapping
  const geographicScopeMap: Record<EnhancedUserRole, GeographicScope['type']> = {
    'resident': 'community',
    'community_leader': 'community',
    'service_provider': 'community',
    'maintenance_staff': 'community',
    'security_officer': 'community',
    'facility_manager': 'community',
    'community_admin': 'community',
    'state_service_manager': 'state',
    'district_coordinator': 'district',
    'state_admin': 'state'
  };

  // Functional access mapping
  const functionalAccessMap: Record<EnhancedUserRole, FunctionalAccess> = {
    'resident': {
      security: false,
      facilities: true,
      services: true,
      administration: false,
      maintenance: false,
      community: true
    },
    'community_leader': {
      security: false,
      facilities: true,
      services: true,
      administration: false,
      maintenance: false,
      community: true
    },
    'service_provider': {
      security: false,
      facilities: true,
      services: true,
      administration: false,
      maintenance: false,
      community: true
    },
    'maintenance_staff': {
      security: false,
      facilities: true,
      services: false,
      administration: false,
      maintenance: true,
      community: false
    },
    'security_officer': {
      security: true,
      facilities: false,
      services: false,
      administration: false,
      maintenance: false,
      community: false
    },
    'facility_manager': {
      security: false,
      facilities: true,
      services: false,
      administration: false,
      maintenance: true,
      community: false
    },
    'community_admin': {
      security: true,
      facilities: true,
      services: true,
      administration: true,
      maintenance: true,
      community: true
    },
    'state_service_manager': {
      security: false,
      facilities: false,
      services: true,
      administration: true,
      maintenance: false,
      community: false
    },
    'district_coordinator': {
      security: true,
      facilities: true,
      services: true,
      administration: true,
      maintenance: true,
      community: true
    },
    'state_admin': {
      security: true,
      facilities: true,
      services: true,
      administration: true,
      maintenance: true,
      community: true
    }
  };

  useEffect(() => {
    if (!loading && userRoles.length > 0) {
      // Get the highest role level
      const highestLevel = Math.max(...userRoles.map(role => roleHierarchy[role]));
      setUserLevel(highestLevel);

      // Get the highest role for scope and functional access
      const highestRole = userRoles.find(role => roleHierarchy[role] === highestLevel);
      if (highestRole) {
        setGeographicScope({ type: geographicScopeMap[highestRole] });
        
        // Combine functional access from all roles (union of permissions)
        const combinedAccess = userRoles.reduce((acc, role) => {
          const roleAccess = functionalAccessMap[role];
          return {
            security: acc.security || roleAccess.security,
            facilities: acc.facilities || roleAccess.facilities,
            services: acc.services || roleAccess.services,
            administration: acc.administration || roleAccess.administration,
            maintenance: acc.maintenance || roleAccess.maintenance,
            community: acc.community || roleAccess.community
          };
        }, {
          security: false,
          facilities: false,
          services: false,
          administration: false,
          maintenance: false,
          community: false
        });
        
        setFunctionalAccess(combinedAccess);
      }
    }
  }, [userRoles, loading]);

  // Access control functions
  const canAccessLevel = (targetLevel: number): boolean => {
    return userLevel >= targetLevel;
  };

  const canViewUserData = (targetUserId: string, targetUserLevel: number = 1): boolean => {
    if (!user) return false;
    // Users can always view their own data
    if (user.id === targetUserId) return true;
    // Higher level users can view lower level user data
    return userLevel > targetUserLevel;
  };

  const canManageUser = (targetUserLevel: number): boolean => {
    // Can only manage users at lower levels
    return userLevel > targetUserLevel;
  };

  const canAccessGeographicScope = (scope: 'community' | 'district' | 'state'): boolean => {
    if (geographicScope.type === 'state') return true;
    if (geographicScope.type === 'district' && (scope === 'district' || scope === 'community')) return true;
    if (geographicScope.type === 'community' && scope === 'community') return true;
    return false;
  };

  const canAccessFunction = (functionType: keyof FunctionalAccess): boolean => {
    return functionalAccess[functionType];
  };

  // Data filtering functions
  const getDataFilters = () => {
    const filters: any = {};
    
    // Geographic filtering
    if (geographicScope.type === 'community' && geographicScope.districtId) {
      filters.district_id = geographicScope.districtId;
    }
    
    return filters;
  };

  const canApproveRoleChange = (currentRole: EnhancedUserRole, requestedRole: EnhancedUserRole): boolean => {
    const currentLevel = roleHierarchy[currentRole];
    const requestedLevel = roleHierarchy[requestedRole];
    
    // Must be higher level than both current and requested roles
    return userLevel > Math.max(currentLevel, requestedLevel);
  };

  // Navigation access control
  const getAccessibleRoutes = () => {
    const routes = [];
    
    // Base routes for all authenticated users
    routes.push('/');
    routes.push('/my-profile');
    routes.push('/announcements');
    routes.push('/events');
    routes.push('/discussions');
    routes.push('/communication');
    
    // Functional access based routes
    if (functionalAccess.facilities) {
      routes.push('/facilities');
      routes.push('/my-bookings');
    }
    
    if (functionalAccess.services) {
      routes.push('/marketplace');
      routes.push('/service-requests');
    }
    
    if (functionalAccess.community) {
      routes.push('/directory');
      routes.push('/my-complaints');
    }
    
    if (functionalAccess.security) {
      routes.push('/cctv-live');
      routes.push('/visitor-security');
      routes.push('/panic-alerts');
      // Security management routes
      if (canAccessLevel(6)) {
        routes.push('/admin/cctv');
      }
    }
    
    if (functionalAccess.administration) {
      routes.push('/admin/users');
      routes.push('/admin/announcements');
      routes.push('/role-management');
    }
    
    if (functionalAccess.maintenance) {
      routes.push('/asset-management');
      routes.push('/inventory-management');
    }
    
    // Level-based routes
    if (canAccessLevel(7)) { // Facility Manager+
      routes.push('/admin/facilities');
      routes.push('/admin/maintenance');
    }
    
    if (canAccessLevel(8)) { // Community Admin+
      routes.push('/admin/community');
      routes.push('/financial-management');
    }
    
    if (canAccessLevel(9)) { // District Coordinator+
      routes.push('/admin/district');
      routes.push('/visitor-analytics');
    }
    
    if (canAccessLevel(10)) { // State Admin
      routes.push('/admin/security-dashboard');
      routes.push('/admin/smart-monitoring');
      routes.push('/admin/sensor-management');
    }
    
    return routes;
  };

  return {
    userLevel,
    geographicScope,
    functionalAccess,
    loading,
    // Access control functions
    canAccessLevel,
    canViewUserData,
    canManageUser,
    canAccessGeographicScope,
    canAccessFunction,
    canApproveRoleChange,
    // Data filtering
    getDataFilters,
    // Navigation
    getAccessibleRoutes,
    // Role checks
    hasRole,
    userRoles
  };
}