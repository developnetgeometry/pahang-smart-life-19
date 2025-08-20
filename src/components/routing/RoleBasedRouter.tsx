import React from 'react';

interface RoleBasedRouterProps {
  children: React.ReactNode;
}

export const RoleBasedRouter: React.FC<RoleBasedRouterProps> = ({ children }) => {
  return <>{children}</>;
};

export default RoleBasedRouter;