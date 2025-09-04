-- Assign service_provider role to the test user sp1
DO $$
DECLARE
    sp1_user_id UUID;
BEGIN
    -- Get the user ID for sp1
    SELECT id INTO sp1_user_id 
    FROM auth.users 
    WHERE email = 'kz3i1@powerscrews.com';
    
    -- If user exists, assign service_provider role
    IF sp1_user_id IS NOT NULL THEN
        INSERT INTO enhanced_user_roles (user_id, role, assigned_by, is_active)
        VALUES (sp1_user_id, 'service_provider', sp1_user_id, true)
        ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;
        
        RAISE NOTICE 'Service provider role assigned to user sp1';
    ELSE
        RAISE NOTICE 'User sp1 not found';
    END IF;
END $$;