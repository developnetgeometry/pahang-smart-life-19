import { ReactNode } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: string;
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
  const { user, isLoading } = useSimpleAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Simplified permission system - just check if user is authenticated
  if (!user) {
    if (showError && !fallback) {
      return (
        <Alert variant="destructive" className="max-w-md">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to access this content.
          </AlertDescription>
        </Alert>
      );
    }
    return fallback || null;
  }

  return <>{children}</>;
}

// Simple module permission checker for compatibility
interface ModulePermissionCheckerProps {
  children: ReactNode;
  module: string;
  permission: 'read' | 'create' | 'update' | 'delete' | 'approve';
  fallback?: ReactNode;
}

export function ModulePermissionChecker({
  children,
  module,
  permission,
  fallback,
}: ModulePermissionCheckerProps) {
  const { user } = useSimpleAuth();

  // Simplified - just show content if user is authenticated
  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}