import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequireNotRolesProps {
  roles: string[];
  redirectTo?: string;
  children: React.ReactNode;
}

export default function RequireNotRoles({ roles, redirectTo = "/seller-dashboard", children }: RequireNotRolesProps) {
  const { hasRole } = useAuth();
  
  // Check if user has any of the forbidden roles
  const hasForbiddenRole = roles.some(role => hasRole(role as any));
  
  if (hasForbiddenRole) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
}