-- Add missing modules that are used in the app routes
INSERT INTO system_modules (module_name, display_name, description, is_active) VALUES
('my_bookings', 'My Bookings', 'User personal bookings management', true),
('profile', 'Profile', 'User profile management', true),
('communication', 'Communication', 'Communication and messaging', true),
('marketplace', 'Marketplace', 'Community marketplace', true),
('role_management', 'Role Management', 'User role management system', true),
('admin_panel', 'Admin Panel', 'Administrative dashboard', true),
('visitor_security', 'Visitor Security', 'Visitor security management', true),
('visitor_analytics', 'Visitor Analytics', 'Visitor analytics and reporting', true)
ON CONFLICT (module_name) DO UPDATE SET
display_name = EXCLUDED.display_name,
description = EXCLUDED.description,
is_active = EXCLUDED.is_active;

-- Set up permissions for the new modules for all roles
-- Resident permissions for new modules
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'resident'::enhanced_user_role, id,
  CASE module_name
    WHEN 'my_bookings' THEN true
    WHEN 'profile' THEN true
    WHEN 'communication' THEN true
    WHEN 'marketplace' THEN true
    WHEN 'role_management' THEN true
    ELSE false
  END as can_read,
  CASE module_name
    WHEN 'my_bookings' THEN true
    WHEN 'communication' THEN true
    WHEN 'marketplace' THEN true
    WHEN 'role_management' THEN true
    ELSE false
  END as can_create,
  CASE module_name
    WHEN 'my_bookings' THEN true
    WHEN 'profile' THEN true
    WHEN 'communication' THEN true
    WHEN 'marketplace' THEN true
    ELSE false
  END as can_update,
  false as can_delete,
  false as can_approve
FROM system_modules
WHERE module_name IN ('my_bookings', 'profile', 'communication', 'marketplace', 'role_management')
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Admin modules - restrict to appropriate levels
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT role, id, true, true, true, true, true
FROM (VALUES 
  ('community_admin'::enhanced_user_role),
  ('district_coordinator'::enhanced_user_role),
  ('state_admin'::enhanced_user_role)
) as roles(role)
CROSS JOIN system_modules
WHERE module_name IN ('admin_panel', 'visitor_security', 'visitor_analytics')
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Security officer permissions for visitor modules
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'security_officer'::enhanced_user_role, id, true, true, true, false, true
FROM system_modules
WHERE module_name IN ('visitor_security', 'visitor_analytics')
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;