-- Delete all existing test data completely
DO $$ 
BEGIN
    -- Delete user roles for test users
    DELETE FROM public.user_roles 
    WHERE user_id IN (
        SELECT id FROM auth.users WHERE email LIKE '%@test.com'
    );

    -- Delete profiles for test users  
    DELETE FROM public.profiles
    WHERE id IN (
        SELECT id FROM auth.users WHERE email LIKE '%@test.com'
    );
    
    -- Delete auth users
    DELETE FROM auth.users WHERE email LIKE '%@test.com';
    
    -- Also clean up any orphaned profiles
    DELETE FROM public.profiles WHERE email LIKE '%@test.com';
    
    -- Clean up any orphaned user roles
    DELETE FROM public.user_roles WHERE user_id::text LIKE '00000000-0000-0000-0000-0000000001%';
END $$;

-- Create all test users with fresh IDs
WITH test_user_data AS (
  SELECT 
    gen_random_uuid() as id,
    'stateadmin@test.com' as email,
    'Dato Ahmad Rashid' as full_name,
    'state_admin'::user_role as role,
    '013-1001001' as phone,
    'State Office' as unit_number,
    '00000000-0000-0000-0000-000000000001'::uuid as district_id
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'districtcoord@test.com',
    'Hajjah Siti Aminah',
    'district_coordinator'::user_role,
    '013-1001002',
    'District Office A',
    '00000000-0000-0000-0000-000000000001'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'communityadmin@test.com',
    'Encik Lim Chee Kong',
    'community_admin'::user_role,
    '013-1001003',
    'Community Center',
    '00000000-0000-0000-0000-000000000001'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'admin@test.com',
    'Ahmad Rahman',
    'admin'::user_role,
    '013-1001004',
    'A-1-01',
    '00000000-0000-0000-0000-000000000001'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'managernorth@test.com',
    'Siti Nurhaliza',
    'manager'::user_role,
    '013-1001005',
    'B-2-05',
    '00000000-0000-0000-0000-000000000001'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'facilitymanager@test.com',
    'Kumar Selvam',
    'facility_manager'::user_role,
    '013-1001006',
    'Facility Office',
    '2384b1ce-dbb1-4449-8e78-136d11dbc28e'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'securitynorth@test.com',
    'Mohd Faizal',
    'security'::user_role,
    '013-1001007',
    'Guard House A',
    '00000000-0000-0000-0000-000000000001'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'maintenancestaff@test.com',
    'Raj Kumar',
    'maintenance_staff'::user_role,
    '013-1001008',
    'Maintenance Office',
    '0a1c51a3-55dd-46b2-b894-c39c6d75557c'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'resident@test.com',
    'Ali bin Hassan',
    'resident'::user_role,
    '013-1001009',
    'A-5-12',
    '00000000-0000-0000-0000-000000000001'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'serviceprovider@test.com',
    'Mary Tan',
    'service_provider'::user_role,
    '013-1001010',
    'Service Center',
    '2384b1ce-dbb1-4449-8e78-136d11dbc28e'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'communityleader@test.com',
    'Fatimah binti Ahmad',
    'community_leader'::user_role,
    '013-1001011',
    'D-6-09',
    '64a08b8c-820d-40e6-910c-0fc03c45ffe5'::uuid
  UNION ALL
  SELECT 
    gen_random_uuid(),
    'stateservicemgr@test.com',
    'David Wong',
    'state_service_manager'::user_role,
    '013-1001012',
    'State Service Office',
    'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'::uuid
),
auth_inserts AS (
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  )
  SELECT 
    id, 
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    email,
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    ('{"full_name": "' || full_name || '"}')::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  FROM test_user_data
  RETURNING id, email
),
profile_inserts AS (
  INSERT INTO public.profiles (id, email, full_name, phone, unit_number, district_id)
  SELECT 
    t.id,
    t.email,
    t.full_name,
    t.phone,
    t.unit_number,
    t.district_id
  FROM test_user_data t
  RETURNING id, email
)
INSERT INTO public.user_roles (user_id, role, district_id)
SELECT 
  t.id,
  t.role,
  t.district_id
FROM test_user_data t;