import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface RequireRolesProps {
  roles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

export const RequireRoles: React.FC<RequireRolesProps> = ({
  roles,
  children,
  redirectTo = "/",
}) => {
  const { hasRole } = useAuth();
  const allowed = roles.some((r) => hasRole(r));
  if (!allowed) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};

export default RequireRoles;
