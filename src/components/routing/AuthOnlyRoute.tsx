import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthOnlyRoute: React.FC<AuthOnlyRouteProps> = ({
  children,
  redirectTo = "/login",
}) => {
  const { user, initializing } = useAuth();
  
  if (initializing) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export default AuthOnlyRoute;