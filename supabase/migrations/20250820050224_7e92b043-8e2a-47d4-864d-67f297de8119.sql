-- Insert comprehensive role permissions matrix

-- Helper function to get module ID by name
CREATE OR REPLACE FUNCTION get_module_id(module_name TEXT)
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT id FROM system_modules WHERE system_modules.module_name = get_module_id.module_name;
$$;

-- State Admin (Level 10) - Full access to everything
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('state_admin', get_module_id('dashboard'), true, true, true, true, true),
('state_admin', get_module_id('announcements'), true, true, true, true, true),
('state_admin', get_module_id('facilities'), true, true, true, true, true),
('state_admin', get_module_id('my_bookings'), true, true, true, true, true),
('state_admin', get_module_id('complaints'), true, true, true, true, true),
('state_admin', get_module_id('discussions'), true, true, true, true, true),
('state_admin', get_module_id('marketplace'), true, true, true, true, true),
('state_admin', get_module_id('cctv'), true, true, true, true, true),
('state_admin', get_module_id('visitors'), true, true, true, true, true),
('state_admin', get_module_id('profile'), true, true, true, true, true),
('state_admin', get_module_id('role_management'), true, true, true, true, true),
('state_admin', get_module_id('admin_panel'), true, true, true, true, true),
('state_admin', get_module_id('communication'), true, true, true, true, true),
('state_admin', get_module_id('visitor_analytics'), true, true, true, true, true),
('state_admin', get_module_id('visitor_security'), true, true, true, true, true);

-- District Coordinator (Level 9) - Full district-level access
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('district_coordinator', get_module_id('dashboard'), true, true, true, true, true),
('district_coordinator', get_module_id('announcements'), true, true, true, true, true),
('district_coordinator', get_module_id('facilities'), true, true, true, true, true),
('district_coordinator', get_module_id('my_bookings'), true, true, true, true, true),
('district_coordinator', get_module_id('complaints'), true, true, true, true, true),
('district_coordinator', get_module_id('discussions'), true, true, true, true, true),
('district_coordinator', get_module_id('marketplace'), true, true, true, true, true),
('district_coordinator', get_module_id('cctv'), true, true, true, true, true),
('district_coordinator', get_module_id('visitors'), true, true, true, true, true),
('district_coordinator', get_module_id('profile'), true, true, true, false, false),
('district_coordinator', get_module_id('role_management'), true, true, true, false, true),
('district_coordinator', get_module_id('admin_panel'), true, true, true, false, true),
('district_coordinator', get_module_id('communication'), true, true, true, true, true),
('district_coordinator', get_module_id('visitor_analytics'), true, true, true, true, true),
('district_coordinator', get_module_id('visitor_security'), true, true, true, true, true);

-- Community Admin (Level 8) - Community-level control
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('community_admin', get_module_id('dashboard'), true, true, true, false, true),
('community_admin', get_module_id('announcements'), true, true, true, true, true),
('community_admin', get_module_id('facilities'), true, true, true, true, true),
('community_admin', get_module_id('my_bookings'), true, true, true, false, true),
('community_admin', get_module_id('complaints'), true, false, true, false, true),
('community_admin', get_module_id('discussions'), true, true, true, true, true),
('community_admin', get_module_id('marketplace'), true, false, true, true, true),
('community_admin', get_module_id('cctv'), true, false, false, false, false),
('community_admin', get_module_id('visitors'), true, true, true, false, true),
('community_admin', get_module_id('profile'), true, true, true, false, false),
('community_admin', get_module_id('role_management'), true, true, true, false, true),
('community_admin', get_module_id('admin_panel'), true, true, true, false, false),
('community_admin', get_module_id('communication'), true, true, true, true, true),
('community_admin', get_module_id('visitor_analytics'), true, false, false, false, false),
('community_admin', get_module_id('visitor_security'), true, false, false, false, false);

-- Facility Manager (Level 7) - Facility management focus
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('facility_manager', get_module_id('dashboard'), true, false, false, false, false),
('facility_manager', get_module_id('announcements'), true, true, true, false, false),
('facility_manager', get_module_id('facilities'), true, true, true, true, false),
('facility_manager', get_module_id('my_bookings'), true, false, true, false, true),
('facility_manager', get_module_id('complaints'), true, false, true, false, false),
('facility_manager', get_module_id('discussions'), true, true, true, false, false),
('facility_manager', get_module_id('marketplace'), true, false, false, false, false),
('facility_manager', get_module_id('cctv'), false, false, false, false, false),
('facility_manager', get_module_id('visitors'), false, false, false, false, false),
('facility_manager', get_module_id('profile'), true, true, true, false, false),
('facility_manager', get_module_id('role_management'), true, true, false, false, false),
('facility_manager', get_module_id('admin_panel'), false, false, false, false, false),
('facility_manager', get_module_id('communication'), true, true, true, false, false),
('facility_manager', get_module_id('visitor_analytics'), false, false, false, false, false),
('facility_manager', get_module_id('visitor_security'), false, false, false, false, false);

-- Security Officer (Level 6) - Security operations
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('security_officer', get_module_id('dashboard'), true, false, false, false, false),
('security_officer', get_module_id('announcements'), true, true, true, false, false),
('security_officer', get_module_id('facilities'), true, false, false, false, false),
('security_officer', get_module_id('my_bookings'), false, false, false, false, false),
('security_officer', get_module_id('complaints'), true, true, true, false, false),
('security_officer', get_module_id('discussions'), true, true, true, false, false),
('security_officer', get_module_id('marketplace'), true, false, false, false, false),
('security_officer', get_module_id('cctv'), true, false, true, false, false),
('security_officer', get_module_id('visitors'), true, true, true, true, false),
('security_officer', get_module_id('profile'), true, true, true, false, false),
('security_officer', get_module_id('role_management'), true, true, false, false, false),
('security_officer', get_module_id('admin_panel'), false, false, false, false, false),
('security_officer', get_module_id('communication'), true, true, true, false, false),
('security_officer', get_module_id('visitor_analytics'), true, false, false, false, false),
('security_officer', get_module_id('visitor_security'), true, true, true, true, false);

-- Maintenance Staff (Level 5) - Task-focused access
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('maintenance_staff', get_module_id('dashboard'), true, false, false, false, false),
('maintenance_staff', get_module_id('announcements'), true, false, false, false, false),
('maintenance_staff', get_module_id('facilities'), true, false, true, false, false),
('maintenance_staff', get_module_id('my_bookings'), false, false, false, false, false),
('maintenance_staff', get_module_id('complaints'), true, false, true, false, false),
('maintenance_staff', get_module_id('discussions'), true, true, true, false, false),
('maintenance_staff', get_module_id('marketplace'), true, false, false, false, false),
('maintenance_staff', get_module_id('cctv'), false, false, false, false, false),
('maintenance_staff', get_module_id('visitors'), false, false, false, false, false),
('maintenance_staff', get_module_id('profile'), true, true, true, false, false),
('maintenance_staff', get_module_id('role_management'), true, true, false, false, false),
('maintenance_staff', get_module_id('admin_panel'), false, false, false, false, false),
('maintenance_staff', get_module_id('communication'), true, true, true, false, false),
('maintenance_staff', get_module_id('visitor_analytics'), false, false, false, false, false),
('maintenance_staff', get_module_id('visitor_security'), false, false, false, false, false);

-- Service Provider (Level 4) - Service-focused access
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('service_provider', get_module_id('dashboard'), true, false, false, false, false),
('service_provider', get_module_id('announcements'), true, false, false, false, false),
('service_provider', get_module_id('facilities'), true, true, false, false, false),
('service_provider', get_module_id('my_bookings'), true, true, true, true, false),
('service_provider', get_module_id('complaints'), true, true, true, false, false),
('service_provider', get_module_id('discussions'), true, true, true, false, false),
('service_provider', get_module_id('marketplace'), true, true, true, true, false),
('service_provider', get_module_id('cctv'), false, false, false, false, false),
('service_provider', get_module_id('visitors'), false, false, false, false, false),
('service_provider', get_module_id('profile'), true, true, true, false, false),
('service_provider', get_module_id('role_management'), true, true, false, false, false),
('service_provider', get_module_id('admin_panel'), false, false, false, false, false),
('service_provider', get_module_id('communication'), true, true, true, false, false),
('service_provider', get_module_id('visitor_analytics'), false, false, false, false, false),
('service_provider', get_module_id('visitor_security'), false, false, false, false, false);

-- Community Leader (Level 3) - Discussion moderation
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('community_leader', get_module_id('dashboard'), true, false, false, false, false),
('community_leader', get_module_id('announcements'), true, true, true, false, false),
('community_leader', get_module_id('facilities'), true, true, false, false, false),
('community_leader', get_module_id('my_bookings'), true, true, true, true, false),
('community_leader', get_module_id('complaints'), true, true, true, false, false),
('community_leader', get_module_id('discussions'), true, true, true, true, true),
('community_leader', get_module_id('marketplace'), true, false, false, false, false),
('community_leader', get_module_id('cctv'), false, false, false, false, false),
('community_leader', get_module_id('visitors'), false, false, false, false, false),
('community_leader', get_module_id('profile'), true, true, true, false, false),
('community_leader', get_module_id('role_management'), true, true, false, false, false),
('community_leader', get_module_id('admin_panel'), false, false, false, false, false),
('community_leader', get_module_id('communication'), true, true, true, true, false),
('community_leader', get_module_id('visitor_analytics'), false, false, false, false, false),
('community_leader', get_module_id('visitor_security'), false, false, false, false, false);

-- State Service Manager (Level 2) - Service coordination
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('state_service_manager', get_module_id('dashboard'), true, false, false, false, false),
('state_service_manager', get_module_id('announcements'), true, true, true, false, false),
('state_service_manager', get_module_id('facilities'), true, false, true, false, false),
('state_service_manager', get_module_id('my_bookings'), true, false, true, false, true),
('state_service_manager', get_module_id('complaints'), true, false, true, false, true),
('state_service_manager', get_module_id('discussions'), true, true, true, false, false),
('state_service_manager', get_module_id('marketplace'), true, false, true, false, true),
('state_service_manager', get_module_id('cctv'), false, false, false, false, false),
('state_service_manager', get_module_id('visitors'), false, false, false, false, false),
('state_service_manager', get_module_id('profile'), true, true, true, false, false),
('state_service_manager', get_module_id('role_management'), true, true, false, false, false),
('state_service_manager', get_module_id('admin_panel'), false, false, false, false, false),
('state_service_manager', get_module_id('communication'), true, true, true, false, false),
('state_service_manager', get_module_id('visitor_analytics'), true, false, false, false, false),
('state_service_manager', get_module_id('visitor_security'), false, false, false, false, false);

-- Resident (Level 1) - Basic access
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) VALUES
('resident', get_module_id('dashboard'), true, false, false, false, false),
('resident', get_module_id('announcements'), true, false, false, false, false),
('resident', get_module_id('facilities'), true, false, false, false, false),
('resident', get_module_id('my_bookings'), true, true, true, true, false),
('resident', get_module_id('complaints'), true, true, true, false, false),
('resident', get_module_id('discussions'), true, true, true, false, false),
('resident', get_module_id('marketplace'), true, true, true, true, false),
('resident', get_module_id('cctv'), false, false, false, false, false),
('resident', get_module_id('visitors'), true, true, true, true, false),
('resident', get_module_id('profile'), true, true, true, false, false),
('resident', get_module_id('role_management'), true, true, false, false, false),
('resident', get_module_id('admin_panel'), false, false, false, false, false),
('resident', get_module_id('communication'), true, true, true, false, false),
('resident', get_module_id('visitor_analytics'), false, false, false, false, false),
('resident', get_module_id('visitor_security'), false, false, false, false, false);

-- Create function to check module permissions
CREATE OR REPLACE FUNCTION public.has_module_permission(
  module_name TEXT,
  permission_type TEXT,
  check_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM enhanced_user_roles eur
    JOIN role_permissions rp ON eur.role = rp.role
    JOIN system_modules sm ON rp.module_id = sm.id
    WHERE eur.user_id = check_user_id
      AND eur.is_active = true
      AND sm.module_name = has_module_permission.module_name
      AND sm.is_active = true
      AND (
        (permission_type = 'read' AND rp.can_read = true) OR
        (permission_type = 'create' AND rp.can_create = true) OR
        (permission_type = 'update' AND rp.can_update = true) OR
        (permission_type = 'delete' AND rp.can_delete = true) OR
        (permission_type = 'approve' AND rp.can_approve = true)
      )
  );
$$;

-- Create function to get user's role information
CREATE OR REPLACE FUNCTION public.get_user_role_info(check_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  role enhanced_user_role,
  level INTEGER,
  permission_level permission_level,
  display_name TEXT,
  description TEXT,
  color_code TEXT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rh.role, rh.level, rh.permission_level, rh.display_name, rh.description, rh.color_code
  FROM enhanced_user_roles eur
  JOIN role_hierarchy rh ON eur.role = rh.role
  WHERE eur.user_id = check_user_id AND eur.is_active = true
  ORDER BY rh.level DESC
  LIMIT 1;
$$;

-- Migrate existing users to enhanced system (assign resident role by default)
INSERT INTO enhanced_user_roles (user_id, role, district_id, assigned_by, assigned_at)
SELECT 
  p.id,
  'resident'::enhanced_user_role,
  p.district_id,
  p.id, -- Self-assigned initially
  now()
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur WHERE eur.user_id = p.id
);