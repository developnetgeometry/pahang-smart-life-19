import { ReactNode, useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

interface PermissionWrapperProps {
  children: ReactNode;
  module: string;
  permission: 'read' | 'create' | 'update' | 'delete' | 'approve';
  fallback?: ReactNode;
  loading?: ReactNode;
}

export function PermissionWrapper({
  children,
  module,
  permission,
  fallback,
  loading,
}: PermissionWrapperProps) {
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
    return loading || (
      <div className="inline-flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
        Loading...
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}