-- Create a test user profile and role to help with authentication testing
-- First check if we have any users in the profiles table
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    -- If no profiles exist, create a test profile
    IF profile_count = 0 THEN
        -- Insert a test profile (this would normally be done by the auth trigger)
        INSERT INTO profiles (id, email, full_name, phone, language_preference, theme_preference, is_verified, district_id)
        VALUES 
        ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', '+1234567890', 'en', 'light', true, 
         (SELECT id FROM districts LIMIT 1));
        
        -- Give the test user a resident role
        INSERT INTO enhanced_user_roles (user_id, role, is_active, assigned_by, district_id)
        VALUES 
        ('00000000-0000-0000-0000-000000000001', 'resident', true, '00000000-0000-0000-0000-000000000001', 
         (SELECT id FROM districts LIMIT 1));
         
        RAISE NOTICE 'Created test user profile and role';
    ELSE
        -- If profiles exist, ensure they have roles
        INSERT INTO enhanced_user_roles (user_id, role, is_active, assigned_by, district_id)
        SELECT p.id, 'resident', true, p.id, p.district_id
        FROM profiles p
        LEFT JOIN enhanced_user_roles eur ON p.id = eur.user_id AND eur.is_active = true
        WHERE eur.user_id IS NULL
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Ensured existing profiles have roles';
    END IF;
END $$;