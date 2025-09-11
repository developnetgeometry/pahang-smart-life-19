/**
 * Role-specific validation utilities for user creation
 */

export interface RoleValidationError {
  field: string;
  message: string;
  code: string;
}

export interface UserCreationData {
  email: string;
  full_name: string;
  phone?: string;
  password?: string;
  unit_number?: string;
  access_expires_at?: string;
  district_id?: string;
  community_id?: string;
  status?: string;
}

/**
 * Validates user data based on role requirements
 */
export function validateUserDataForRole(
  role: string, 
  data: UserCreationData
): RoleValidationError[] {
  const errors: RoleValidationError[] = [];
  
  // Common validations
  if (!data.email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED_FIELD'
    });
  } else if (!isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT'
    });
  }
  
  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.push({
      field: 'full_name',
      message: 'Full name must be at least 2 characters',
      code: 'INVALID_LENGTH'
    });
  }
  
  // Role-specific validations
  switch (role) {
    case 'resident':
      if (!data.unit_number) {
        errors.push({
          field: 'unit_number',
          message: 'Unit number is required for residents',
          code: 'REQUIRED_FIELD'
        });
      }
      break;
      
    case 'guest':
      if (!data.access_expires_at) {
        errors.push({
          field: 'access_expires_at',
          message: 'Expiration date is required for guests',
          code: 'REQUIRED_FIELD'
        });
      } else if (new Date(data.access_expires_at) <= new Date()) {
        errors.push({
          field: 'access_expires_at',
          message: 'Expiration date must be in the future',
          code: 'INVALID_DATE'
        });
      }
      break;
      
    case 'security_officer':
    case 'facility_manager':
    case 'maintenance_staff':
      if (!data.password) {
        errors.push({
          field: 'password',
          message: 'Password is required for staff roles',
          code: 'REQUIRED_FIELD'
        });
      } else if (data.password.length < 8) {
        errors.push({
          field: 'password',
          message: 'Password must be at least 8 characters long',
          code: 'INVALID_LENGTH'
        });
      }
      
      if (!data.status) {
        errors.push({
          field: 'status',
          message: 'Account status is required for staff roles',
          code: 'REQUIRED_FIELD'
        });
      }
      break;
      
    case 'community_admin':
      if (!data.password) {
        errors.push({
          field: 'password',
          message: 'Password is required for admin roles',
          code: 'REQUIRED_FIELD'
        });
      }
      
      if (!data.community_id) {
        errors.push({
          field: 'community_id',
          message: 'Community ID is required for community admins',
          code: 'REQUIRED_FIELD'
        });
      }
      
      if (!data.district_id) {
        errors.push({
          field: 'district_id',
          message: 'District ID is required for community admins',
          code: 'REQUIRED_FIELD'
        });
      }
      break;
      
    case 'district_coordinator':
    case 'state_admin':
      if (!data.password) {
        errors.push({
          field: 'password',
          message: 'Password is required for admin roles',
          code: 'REQUIRED_FIELD'
        });
      }
      
      if (role === 'district_coordinator' && !data.district_id) {
        errors.push({
          field: 'district_id',
          message: 'District ID is required for district coordinators',
          code: 'REQUIRED_FIELD'
        });
      }
      break;
  }
  
  return errors;
}

/**
 * Get role-specific default values
 */
export function getRoleDefaults(role: string): Partial<UserCreationData> {
  switch (role) {
    case 'resident':
      return {
        status: 'pending' // Residents start as pending approval
      };
      
    case 'guest':
      return {
        // Guests get 30-day access by default
        access_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
    case 'security_officer':
    case 'facility_manager':
    case 'maintenance_staff':
      return {
        status: 'approved' // Staff roles are typically pre-approved
      };
      
    case 'community_admin':
    case 'district_coordinator':
    case 'state_admin':
      return {
        status: 'approved' // Admin roles are pre-approved
      };
      
    default:
      return {};
  }
}

/**
 * Get human-readable role description
 */
export function getRoleDescription(role: string): string {
  const descriptions = {
    resident: 'Community residents with basic access to facilities and services',
    guest: 'Temporary visitors with limited access and expiration date',
    security_officer: 'Security personnel responsible for community safety and monitoring',
    facility_manager: 'Staff managing community facilities, bookings, and maintenance',
    maintenance_staff: 'Technical staff handling repairs and facility upkeep',
    community_admin: 'Administrators managing a specific community within a district',
    district_coordinator: 'Coordinators overseeing multiple communities in a district',
    state_admin: 'Top-level administrators with full system access'
  };
  
  return descriptions[role as keyof typeof descriptions] || 'Unknown role';
}

/**
 * Get role permission level (higher = more permissions)
 */
export function getRolePermissionLevel(role: string): number {
  const levels = {
    guest: 1,
    resident: 2,
    security_officer: 3,
    facility_manager: 4,
    maintenance_staff: 4,
    community_leader: 5,
    service_provider: 5,
    community_admin: 6,
    district_coordinator: 7,
    state_admin: 8
  };
  
  return levels[role as keyof typeof levels] || 0;
}

/**
 * Check if user can create accounts of specified role
 */
export function canCreateRole(creatorRole: string, targetRole: string): boolean {
  const creatorLevel = getRolePermissionLevel(creatorRole);
  const targetLevel = getRolePermissionLevel(targetRole);
  
  // Generally, you can create roles at your level or below
  // Special exceptions for certain role combinations
  if (creatorRole === 'community_admin') {
    return ['resident', 'guest', 'security_officer', 'facility_manager', 'maintenance_staff'].includes(targetRole);
  }
  
  if (creatorRole === 'district_coordinator') {
    return targetLevel <= 6; // Can create up to community_admin level
  }
  
  if (creatorRole === 'state_admin') {
    return true; // Can create any role
  }
  
  return creatorLevel > targetLevel;
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get role creation requirements summary
 */
export function getRoleRequirements(role: string): {
  requiredFields: string[];
  optionalFields: string[];
  permissions: string[];
  description: string;
} {
  const baseRequired = ['email', 'full_name'];
  const baseOptional = ['phone'];
  
  switch (role) {
    case 'resident':
      return {
        requiredFields: [...baseRequired, 'unit_number'],
        optionalFields: baseOptional,
        permissions: ['Facility booking', 'Community discussions', 'Service requests'],
        description: getRoleDescription(role)
      };
      
    case 'guest':
      return {
        requiredFields: [...baseRequired, 'access_expires_at'],
        optionalFields: baseOptional,
        permissions: ['Limited facility access', 'Visitor registration'],
        description: getRoleDescription(role)
      };
      
    case 'security_officer':
      return {
        requiredFields: [...baseRequired, 'password'],
        optionalFields: [...baseOptional, 'status'],
        permissions: ['CCTV access', 'Incident reporting', 'Visitor management'],
        description: getRoleDescription(role)
      };
      
    case 'community_admin':
      return {
        requiredFields: [...baseRequired, 'password', 'community_id', 'district_id'],
        optionalFields: baseOptional,
        permissions: ['User management', 'Community settings', 'Facility management'],
        description: getRoleDescription(role)
      };
      
    default:
      return {
        requiredFields: baseRequired,
        optionalFields: baseOptional,
        permissions: [],
        description: getRoleDescription(role)
      };
  }
}