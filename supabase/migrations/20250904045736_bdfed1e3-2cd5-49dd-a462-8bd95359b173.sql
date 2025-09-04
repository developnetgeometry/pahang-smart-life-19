-- Fix role assignment for serviceprovider@test.com
DO $$
DECLARE
    sp_user_id UUID;
BEGIN
    -- Get the user ID for serviceprovider@test.com
    SELECT id INTO sp_user_id 
    FROM auth.users 
    WHERE email = 'serviceprovider@test.com';
    
    -- If user exists, assign service_provider role
    IF sp_user_id IS NOT NULL THEN
        INSERT INTO enhanced_user_roles (user_id, role, assigned_by, is_active)
        VALUES (sp_user_id, 'service_provider', sp_user_id, true)
        ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;
        
        RAISE NOTICE 'Service provider role assigned to serviceprovider@test.com';
    ELSE
        RAISE NOTICE 'User serviceprovider@test.com not found';
    END IF;
END $$;