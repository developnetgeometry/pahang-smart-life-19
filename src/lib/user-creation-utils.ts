/**
 * Maps user roles to their corresponding Edge Function names
 * Throws error for unsupported roles instead of fallback
 */
export const getRoleSpecificFunction = (role: string): string => {
  const roleMap: Record<string, string> = {
    'resident': 'admin-create-resident',
    'guest': 'admin-create-guest',
    'security_officer': 'admin-create-security',
    'facility_manager': 'admin-create-facility-staff',
    'maintenance_staff': 'admin-create-facility-staff',
    'community_admin': 'admin-create-admin',
    'district_coordinator': 'admin-create-admin',
    'state_admin': 'admin-create-admin'
  };
  
  const functionName = roleMap[role];
  if (!functionName) {
    throw new Error(`No Edge Function configured for role: ${role}`);
  }
  
  return functionName;
};

/**
 * Validates if a role has a corresponding Edge Function
 */
export const isRoleSupported = (role: string): boolean => {
  const supportedRoles = [
    'resident', 'guest', 'security_officer', 'facility_manager', 
    'maintenance_staff', 'community_admin', 'district_coordinator', 'state_admin'
  ];
  return supportedRoles.includes(role);
};