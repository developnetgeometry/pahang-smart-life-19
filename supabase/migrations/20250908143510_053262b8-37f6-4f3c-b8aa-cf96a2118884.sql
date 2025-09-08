-- Migrate legacy roles to enhanced roles with proper mapping
-- First, insert roles from user_roles into enhanced_user_roles with mappings

-- Map legacy admin -> community_admin
INSERT INTO enhanced_user_roles (user_id, role, assigned_by, assigned_at, district_id, is_active)
SELECT 
  ur.user_id,
  'community_admin'::enhanced_user_role,
  ur.user_id, -- self-assigned for migration
  ur.created_at,
  ur.district_id,
  true
FROM user_roles ur
WHERE ur.role = 'admin'::app_role
AND NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur 
  WHERE eur.user_id = ur.user_id AND eur.role = 'community_admin'::enhanced_user_role
);

-- Map legacy manager -> facility_manager
INSERT INTO enhanced_user_roles (user_id, role, assigned_by, assigned_at, district_id, is_active)
SELECT 
  ur.user_id,
  'facility_manager'::enhanced_user_role,
  ur.user_id,
  ur.created_at,
  ur.district_id,
  true
FROM user_roles ur
WHERE ur.role = 'manager'::app_role
AND NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur 
  WHERE eur.user_id = ur.user_id AND eur.role = 'facility_manager'::enhanced_user_role
);

-- Map legacy security -> security_officer (if not already exists)
INSERT INTO enhanced_user_roles (user_id, role, assigned_by, assigned_at, district_id, is_active)
SELECT 
  ur.user_id,
  'security_officer'::enhanced_user_role,
  ur.user_id,
  ur.created_at,
  ur.district_id,
  true
FROM user_roles ur
WHERE ur.role = 'security'::app_role
AND NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur 
  WHERE eur.user_id = ur.user_id AND eur.role = 'security_officer'::enhanced_user_role
);

-- Map other roles that should transfer directly (if they don't exist in enhanced_user_roles yet)
INSERT INTO enhanced_user_roles (user_id, role, assigned_by, assigned_at, district_id, is_active)
SELECT 
  ur.user_id,
  ur.role::text::enhanced_user_role,
  ur.user_id,
  ur.created_at,
  ur.district_id,
  true
FROM user_roles ur
WHERE ur.role::text IN ('resident', 'state_admin', 'district_coordinator', 'community_admin', 'community_leader', 'maintenance_staff', 'service_provider', 'state_service_manager', 'facility_manager', 'security_officer')
AND NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur 
  WHERE eur.user_id = ur.user_id AND eur.role = ur.role::text::enhanced_user_role
);

-- Add comment for migration tracking
COMMENT ON TABLE enhanced_user_roles IS 'Enhanced role system - migrated from legacy user_roles table';