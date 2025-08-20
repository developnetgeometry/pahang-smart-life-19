-- First, let's create a test user profile and roles for the current session
-- This will help with the authentication issue

-- Get the test user ID that should exist
DO $$ 
DECLARE
    test_user_id uuid := 'bfe88021-d76b-4f65-8b43-1b879ad4617a'; -- Ali bin Hassan from auth logs
    district_id uuid := 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'; -- Pahang Prima North
BEGIN
    -- Create or update profile for the test user
    INSERT INTO public.profiles (id, email, full_name, district_id)
    VALUES (
        test_user_id,
        'resident@test.com',
        'Ali bin Hassan',
        district_id
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        district_id = EXCLUDED.district_id;

    -- Create enhanced user role for the test user
    INSERT INTO public.enhanced_user_roles (user_id, role, district_id, assigned_by, is_active)
    VALUES (
        test_user_id,
        'resident',
        district_id,
        test_user_id,
        true
    )
    ON CONFLICT (user_id, role) DO UPDATE SET
        is_active = true,
        district_id = EXCLUDED.district_id;

    -- Also create a legacy user_roles entry for compatibility
    INSERT INTO public.user_roles (user_id, role, district_id)
    VALUES (
        test_user_id,
        'resident',
        district_id
    )
    ON CONFLICT (user_id, role) DO NOTHING;

END $$;