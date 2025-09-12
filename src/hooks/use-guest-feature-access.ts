import { useUserRoles } from '@/hooks/use-user-roles';
import { useGuestPermissions } from '@/hooks/use-guest-permissions';

/**
 * Hook to check if a user has access to a specific feature
 * Takes into account both regular role permissions and guest restrictions
 */
export function useGuestFeatureAccess() {
  const { hasRole } = useUserRoles();
  const { hasFeaturePermission } = useGuestPermissions();

  const hasFeatureAccess = (featureName: string): boolean => {
    // If user is not a guest, they have normal access based on their roles
    if (!hasRole('guest')) {
      return true;
    }

    // For guest users, check if the feature is enabled for them
    return hasFeaturePermission(featureName);
  };

  return {
    hasFeatureAccess,
    isGuest: hasRole('guest')
  };
}