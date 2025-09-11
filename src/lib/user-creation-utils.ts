/**
 * Maps user roles to their corresponding Edge Function names
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
  
  return roleMap[role] || 'admin-create-user'; // fallback to legacy function
};