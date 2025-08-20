-- Create comprehensive dynamic permissions system

-- First, ensure we have all the modules defined
INSERT INTO system_modules (module_name, display_name, description, is_active) VALUES
('announcements', 'Announcements', 'Community announcements and notices', true),
('events', 'Events', 'Community events and activities', true),
('facilities', 'Facilities', 'Facility booking and management', true),
('bookings', 'Bookings', 'Facility bookings management', true),
('complaints', 'Complaints', 'Complaints and issue tracking', true),
('discussions', 'Discussions', 'Community discussions and forums', true),
('visitors', 'Visitors', 'Visitor management and tracking', true),
('security', 'Security', 'Security monitoring and access control', true),
('maintenance', 'Maintenance', 'Maintenance requests and tracking', true),
('financial', 'Financial', 'Financial records and management', true),
('user_management', 'User Management', 'User account and role management', true),
('analytics', 'Analytics', 'System analytics and reporting', true),
('inventory', 'Inventory', 'Inventory and asset management', true),
('documents', 'Documents', 'Document management system', true),
('emergency', 'Emergency', 'Emergency contacts and procedures', true),
('chat', 'Chat', 'Real-time communication system', true),
('deliveries', 'Deliveries', 'Package and delivery management', true),
('cctv', 'CCTV', 'CCTV monitoring and management', true),
('access_control', 'Access Control', 'Door access and card management', true),
('community_groups', 'Community Groups', 'Community group management', true)
ON CONFLICT (module_name) DO UPDATE SET
display_name = EXCLUDED.display_name,
description = EXCLUDED.description,
is_active = EXCLUDED.is_active;

-- Now set up role permissions for each role and module combination
-- Level 1: Resident permissions
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) 
SELECT 'resident'::enhanced_user_role, id, 
  CASE module_name 
    WHEN 'announcements' THEN true
    WHEN 'events' THEN true 
    WHEN 'facilities' THEN true
    WHEN 'bookings' THEN true
    WHEN 'complaints' THEN true
    WHEN 'discussions' THEN true
    WHEN 'visitors' THEN true
    WHEN 'documents' THEN true
    WHEN 'emergency' THEN true
    WHEN 'chat' THEN true
    WHEN 'deliveries' THEN true
    WHEN 'community_groups' THEN true
    ELSE false
  END as can_read,
  CASE module_name
    WHEN 'bookings' THEN true
    WHEN 'complaints' THEN true
    WHEN 'discussions' THEN true
    WHEN 'visitors' THEN true
    WHEN 'chat' THEN true
    WHEN 'community_groups' THEN true
    ELSE false
  END as can_create,
  CASE module_name
    WHEN 'bookings' THEN true -- own bookings only
    WHEN 'discussions' THEN true -- own posts only
    WHEN 'visitors' THEN true -- own visitors only
    ELSE false
  END as can_update,
  CASE module_name
    WHEN 'discussions' THEN true -- own posts only
    ELSE false
  END as can_delete,
  false as can_approve -- residents cannot approve anything
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Level 3: Community Leader permissions
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'community_leader'::enhanced_user_role, id,
  CASE module_name
    WHEN 'user_management' THEN false
    WHEN 'financial' THEN false
    WHEN 'analytics' THEN false
    WHEN 'security' THEN false
    WHEN 'cctv' THEN false
    WHEN 'access_control' THEN false
    ELSE true
  END as can_read,
  CASE module_name
    WHEN 'announcements' THEN true
    WHEN 'events' THEN true
    WHEN 'bookings' THEN true
    WHEN 'complaints' THEN true
    WHEN 'discussions' THEN true
    WHEN 'visitors' THEN true
    WHEN 'chat' THEN true
    WHEN 'community_groups' THEN true
    ELSE false
  END as can_create,
  CASE module_name
    WHEN 'events' THEN true
    WHEN 'discussions' THEN true
    WHEN 'community_groups' THEN true
    ELSE true -- inherit resident permissions plus community management
  END as can_update,
  CASE module_name
    WHEN 'discussions' THEN true -- inappropriate content
    WHEN 'community_groups' THEN true
    ELSE false
  END as can_delete,
  CASE module_name
    WHEN 'events' THEN true -- event registrations
    WHEN 'community_groups' THEN true -- group memberships
    ELSE false
  END as can_approve
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Level 4: Service Provider permissions  
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'service_provider'::enhanced_user_role, id,
  CASE module_name
    WHEN 'user_management' THEN false
    WHEN 'financial' THEN true -- limited to own invoices
    WHEN 'analytics' THEN false
    WHEN 'security' THEN false
    WHEN 'cctv' THEN false
    WHEN 'access_control' THEN false
    ELSE true
  END as can_read,
  CASE module_name
    WHEN 'maintenance' THEN true
    WHEN 'financial' THEN true -- invoices
    WHEN 'inventory' THEN true -- service materials
    ELSE true -- inherit community leader permissions
  END as can_create,
  CASE module_name
    WHEN 'maintenance' THEN true
    WHEN 'inventory' THEN true
    ELSE true
  END as can_update,
  CASE module_name
    WHEN 'maintenance' THEN true -- own records
    ELSE false
  END as can_delete,
  CASE module_name
    WHEN 'maintenance' THEN true -- service completions
    ELSE false
  END as can_approve
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Level 5: Maintenance Staff permissions
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'maintenance_staff'::enhanced_user_role, id,
  CASE module_name
    WHEN 'user_management' THEN false
    WHEN 'financial' THEN true -- maintenance costs
    WHEN 'analytics' THEN false
    WHEN 'security' THEN false
    WHEN 'cctv' THEN false
    WHEN 'access_control' THEN false
    ELSE true
  END as can_read,
  CASE module_name
    WHEN 'maintenance' THEN true
    WHEN 'inventory' THEN true
    WHEN 'financial' THEN true -- maintenance invoices
    ELSE true
  END as can_create,
  CASE module_name
    WHEN 'maintenance' THEN true
    WHEN 'inventory' THEN true
    WHEN 'facilities' THEN true -- maintenance status
    ELSE true
  END as can_update,
  CASE module_name
    WHEN 'maintenance' THEN true -- own records
    WHEN 'inventory' THEN false
    ELSE false
  END as can_delete,
  CASE module_name
    WHEN 'maintenance' THEN true
    WHEN 'inventory' THEN true -- inventory requests
    ELSE true -- inherit service provider permissions
  END as can_approve
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Level 6: Security Officer permissions
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'security_officer'::enhanced_user_role, id,
  CASE module_name
    WHEN 'user_management' THEN false
    WHEN 'financial' THEN false
    WHEN 'analytics' THEN false
    ELSE true -- full read access to security-related modules
  END as can_read,
  CASE module_name
    WHEN 'security' THEN true
    WHEN 'cctv' THEN true
    WHEN 'access_control' THEN true
    WHEN 'visitors' THEN true
    WHEN 'deliveries' THEN true
    ELSE true
  END as can_create,
  CASE module_name
    WHEN 'security' THEN true
    WHEN 'cctv' THEN true
    WHEN 'access_control' THEN true
    WHEN 'visitors' THEN true
    WHEN 'deliveries' THEN true
    ELSE true
  END as can_update,
  CASE module_name
    WHEN 'security' THEN true -- false alerts only
    ELSE false
  END as can_delete,
  CASE module_name
    WHEN 'visitors' THEN true
    WHEN 'access_control' THEN true
    WHEN 'security' THEN true -- security clearances
    ELSE true
  END as can_approve
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Level 7: Facility Manager permissions
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'facility_manager'::enhanced_user_role, id,
  CASE module_name
    WHEN 'user_management' THEN false
    WHEN 'analytics' THEN true -- facility analytics
    ELSE true
  END as can_read,
  CASE module_name
    WHEN 'facilities' THEN true
    WHEN 'bookings' THEN true
    WHEN 'maintenance' THEN true
    WHEN 'financial' THEN true -- facility revenue
    ELSE true
  END as can_create,
  CASE module_name
    WHEN 'facilities' THEN true
    WHEN 'bookings' THEN true
    WHEN 'maintenance' THEN true
    ELSE true
  END as can_update,
  CASE module_name
    WHEN 'bookings' THEN true -- cancelled bookings
    ELSE true
  END as can_delete,
  CASE module_name
    WHEN 'bookings' THEN true
    WHEN 'maintenance' THEN true
    WHEN 'facilities' THEN true -- facility modifications
    ELSE true
  END as can_approve
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Level 8: Community Admin permissions
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'community_admin'::enhanced_user_role, id,
  CASE module_name
    WHEN 'analytics' THEN true -- district analytics
    ELSE true -- almost full read access
  END as can_read,
  CASE module_name
    WHEN 'user_management' THEN true
    WHEN 'announcements' THEN true
    WHEN 'financial' THEN true
    ELSE true
  END as can_create,
  CASE module_name
    WHEN 'user_management' THEN true -- limited
    WHEN 'complaints' THEN true
    ELSE true
  END as can_update,
  CASE module_name
    WHEN 'announcements' THEN true -- expired ones
    WHEN 'complaints' THEN true -- resolved ones
    ELSE true
  END as can_delete,
  CASE module_name
    WHEN 'user_management' THEN true -- up to level 6
    WHEN 'financial' THEN true -- budget items
    ELSE true
  END as can_approve
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Level 9: District Coordinator permissions  
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'district_coordinator'::enhanced_user_role, id,
  true as can_read, -- full read access
  true as can_create,
  true as can_update,
  CASE module_name
    WHEN 'user_management' THEN true -- inactive accounts
    WHEN 'announcements' THEN true -- obsolete policies
    ELSE true
  END as can_delete,
  true as can_approve -- can approve up to level 8
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- Level 10: State Admin permissions
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'state_admin'::enhanced_user_role, id,
  true as can_read, -- full system access
  true as can_create,
  true as can_update,
  true as can_delete, -- with restrictions
  true as can_approve -- all approvals
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;

-- State Service Manager permissions (Level 2)
INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
SELECT 'state_service_manager'::enhanced_user_role, id,
  CASE module_name
    WHEN 'maintenance' THEN true
    WHEN 'financial' THEN true -- summaries only
    WHEN 'inventory' THEN true
    WHEN 'user_management' THEN false
    WHEN 'security' THEN false
    WHEN 'cctv' THEN false
    WHEN 'access_control' THEN false
    WHEN 'analytics' THEN false
    ELSE true -- inherit resident permissions
  END as can_read,
  CASE module_name
    WHEN 'maintenance' THEN true
    WHEN 'inventory' THEN true
    ELSE true -- inherit resident permissions
  END as can_create,
  CASE module_name
    WHEN 'maintenance' THEN true
    ELSE true
  END as can_update,
  false as can_delete,
  CASE module_name
    WHEN 'maintenance' THEN true -- basic service requests
    ELSE false
  END as can_approve
FROM system_modules
ON CONFLICT (role, module_id) DO UPDATE SET
can_read = EXCLUDED.can_read,
can_create = EXCLUDED.can_create,
can_update = EXCLUDED.can_update,
can_delete = EXCLUDED.can_delete,
can_approve = EXCLUDED.can_approve;