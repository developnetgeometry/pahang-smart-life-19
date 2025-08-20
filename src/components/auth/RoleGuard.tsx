import { ReactNode } from 'react';
import { useEnhancedAuth, EnhancedUserRole } from '@/hooks/useEnhancedAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: EnhancedUserRole;
  requiredLevel?: number;
  module?: string;
  permission?: 'read' | 'create' | 'update' | 'delete' | 'approve';
  fallback?: ReactNode;
  showError?: boolean;
}

export function RoleGuard({
  children,
  requiredRole,
  requiredLevel,
  module,
  permission = 'read',
  fallback,
  showError = true,
}: RoleGuardProps) {
  const { hasRole, hasRoleLevel, hasModulePermission, isLoading, roleInfo } = useEnhancedAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return renderAccessDenied();
  }

  // Check level-based access
  if (requiredLevel && !hasRoleLevel(requiredLevel)) {
    return renderAccessDenied();
  }

  // For module permissions, we need to check asynchronously
  if (module) {
    return (
      <ModulePermissionChecker
        module={module}
        permission={permission}
        onAccessDenied={() => renderAccessDenied()}
        onAccessGranted={() => children}
      />
    );
  }

  return <>{children}</>;

  function renderAccessDenied() {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showError) {
      return null;
    }

    return (
      <Alert className="border-destructive/50 text-destructive">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          Access denied. Your current role ({roleInfo?.display_name || 'None'}) does not have sufficient permissions to access this content.
        </AlertDescription>
      </Alert>
    );
  }
}

// Component to handle async permission checking
function ModulePermissionChecker({
  module,
  permission,
  onAccessDenied,
  onAccessGranted,
}: {
  module: string;
  permission: string;
  onAccessDenied: () => ReactNode;
  onAccessGranted: () => ReactNode;
}) {
  const { hasModulePermission } = useEnhancedAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      const access = await hasModulePermission(module, permission);
      setHasAccess(access);
    };

    checkPermission();
  }, [module, permission, hasModulePermission]);

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return hasAccess ? onAccessGranted() : onAccessDenied();
}

// Import statements for React hooks
import { useState, useEffect } from 'react';