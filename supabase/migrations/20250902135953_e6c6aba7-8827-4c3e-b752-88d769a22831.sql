-- Ensure system_modules table has the necessary modules
INSERT INTO system_modules (module_name, display_name, description, category, is_active) VALUES
('announcements', 'Announcements', 'Community announcements and notices', 'communication', true),
('complaints', 'Complaints Management', 'Handle resident complaints', 'services', true),
('discussions', 'Community Discussions', 'Community forum and discussions', 'communication', true),
('marketplace', 'Marketplace', 'Buy and sell items within community', 'community', true),
('events', 'Events & Activities', 'Community events and activities', 'community', true),
('facilities', 'Facilities Management', 'Manage community facilities', 'community', true),
('bookings', 'Facility Bookings', 'Book community facilities', 'community', true),
('visitors', 'Visitor Management', 'Manage visitor registrations', 'security', true),
('cctv', 'CCTV Monitoring', 'Monitor security cameras', 'security', true),
('directory', 'Community Directory', 'Community member directory', 'information', true),
('service_requests', 'Service Requests', 'Request maintenance and services', 'services', true),
('notifications', 'Notifications', 'System notifications management', 'communication', true)
ON CONFLICT (module_name) DO UPDATE SET
display_name = EXCLUDED.display_name,
description = EXCLUDED.description,
category = EXCLUDED.category,
is_active = EXCLUDED.is_active;

-- Ensure role_hierarchy table has proper role data
INSERT INTO role_hierarchy (role, level, permission_level, display_name, description, color_code) VALUES
('resident', 1, 'limited_access', 'Resident', 'Basic community member', '#10b981'),
('spouse', 2, 'limited_access', 'Spouse', 'Spouse of primary resident', '#06b6d4'),
('tenant', 2, 'limited_access', 'Tenant', 'Tenant in community', '#8b5cf6'),
('community_leader', 3, 'standard_access', 'Community Leader', 'Elected community representative', '#f59e0b'),
('service_provider', 3, 'standard_access', 'Service Provider', 'Approved service provider', '#ef4444'),
('maintenance_staff', 4, 'standard_access', 'Maintenance Staff', 'Maintenance team member', '#f97316'),
('security_officer', 4, 'standard_access', 'Security Officer', 'Security personnel', '#3b82f6'),
('community_admin', 5, 'full_access', 'Community Admin', 'Community administrator', '#8b5cf6'),
('district_coordinator', 6, 'full_access', 'District Coordinator', 'District-level coordinator', '#ec4899'),
('state_service_manager', 7, 'full_access', 'State Service Manager', 'State service manager', '#6366f1'),
('state_admin', 8, 'full_access', 'State Admin', 'State-level administrator', '#dc2626')
ON CONFLICT (role) DO UPDATE SET
level = EXCLUDED.level,
permission_level = EXCLUDED.permission_level,
display_name = EXCLUDED.display_name,
description = EXCLUDED.description,
color_code = EXCLUDED.color_code;

-- Create default role permissions for basic roles
DO $$
DECLARE
    module_rec RECORD;
    role_name TEXT;
BEGIN
    -- Loop through each module
    FOR module_rec IN SELECT id, module_name FROM system_modules WHERE is_active = true
    LOOP
        -- Resident permissions (basic read access)
        INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
        VALUES ('resident', module_rec.id, true, 
                CASE WHEN module_rec.module_name IN ('complaints', 'service_requests', 'marketplace', 'bookings') THEN true ELSE false END,
                CASE WHEN module_rec.module_name IN ('complaints', 'service_requests', 'marketplace') THEN true ELSE false END,
                false, false)
        ON CONFLICT (role, module_id) DO NOTHING;

        -- Community Admin permissions (full access to most modules)
        INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
        VALUES ('community_admin', module_rec.id, true, true, true, true, true)
        ON CONFLICT (role, module_id) DO NOTHING;

        -- District Coordinator permissions (full access)
        INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
        VALUES ('district_coordinator', module_rec.id, true, true, true, true, true)
        ON CONFLICT (role, module_id) DO NOTHING;

        -- State Admin permissions (full access)
        INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
        VALUES ('state_admin', module_rec.id, true, true, true, true, true)
        ON CONFLICT (role, module_id) DO NOTHING;

        -- Security Officer permissions (security-focused modules)
        INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
        VALUES ('security_officer', module_rec.id, true, 
                CASE WHEN module_rec.module_name IN ('visitors', 'cctv', 'complaints') THEN true ELSE false END,
                CASE WHEN module_rec.module_name IN ('visitors', 'complaints') THEN true ELSE false END,
                false,
                CASE WHEN module_rec.module_name IN ('visitors') THEN true ELSE false END)
        ON CONFLICT (role, module_id) DO NOTHING;

        -- Maintenance Staff permissions (maintenance-focused modules)
        INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
        VALUES ('maintenance_staff', module_rec.id, true, 
                CASE WHEN module_rec.module_name IN ('service_requests', 'complaints', 'facilities') THEN true ELSE false END,
                CASE WHEN module_rec.module_name IN ('service_requests', 'complaints', 'facilities') THEN true ELSE false END,
                false, false)
        ON CONFLICT (role, module_id) DO NOTHING;

        -- Service Provider permissions (marketplace-focused)
        INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
        VALUES ('service_provider', module_rec.id, true, 
                CASE WHEN module_rec.module_name IN ('marketplace', 'service_requests') THEN true ELSE false END,
                CASE WHEN module_rec.module_name IN ('marketplace', 'service_requests') THEN true ELSE false END,
                CASE WHEN module_rec.module_name IN ('marketplace') THEN true ELSE false END,
                false)
        ON CONFLICT (role, module_id) DO NOTHING;

    END LOOP;
END $$;