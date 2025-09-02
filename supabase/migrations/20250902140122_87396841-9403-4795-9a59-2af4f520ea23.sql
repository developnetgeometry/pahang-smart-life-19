-- Add basic role permissions for key roles
DO $$
DECLARE
    module_rec RECORD;
BEGIN
    -- Get all modules
    FOR module_rec IN SELECT id, module_name FROM system_modules WHERE is_active = true
    LOOP
        -- Resident permissions (basic read access and limited create/update)
        INSERT INTO role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve)
        VALUES ('resident', module_rec.id, true, 
                CASE WHEN module_rec.module_name IN ('complaints', 'service_requests', 'marketplace', 'bookings') THEN true ELSE false END,
                CASE WHEN module_rec.module_name IN ('complaints', 'service_requests', 'marketplace') THEN true ELSE false END,
                false, false)
        ON CONFLICT (role, module_id) DO NOTHING;

        -- Community Admin permissions (full access)
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

    END LOOP;
END $$;