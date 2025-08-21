import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/use-access-control';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredLevel?: number;
  requiredFunction?: 'security' | 'facilities' | 'services' | 'administration' | 'maintenance' | 'community';
  requiredScope?: 'community' | 'district' | 'state';
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredLevel, 
  requiredFunction,
  requiredScope,
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { user } = useAuth();
  const { 
    canAccessLevel, 
    canAccessFunction, 
    canAccessGeographicScope, 
    loading,
    userLevel
  } = useAccessControl();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check level access
  if (requiredLevel && !canAccessLevel(requiredLevel)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need level {requiredLevel} access or higher. Your current level: {userLevel}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check functional access
  if (requiredFunction && !canAccessFunction(requiredFunction)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Access denied. You don't have access to {requiredFunction} functions.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check geographic scope
  if (requiredScope && !canAccessGeographicScope(requiredScope)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. You don't have access to {requiredScope}-level data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}