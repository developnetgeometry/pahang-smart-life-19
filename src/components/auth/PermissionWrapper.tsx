import { ReactNode } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

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
  const { user } = useSimpleAuth();

  // Simplified permission system - just show content if user is authenticated
  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}