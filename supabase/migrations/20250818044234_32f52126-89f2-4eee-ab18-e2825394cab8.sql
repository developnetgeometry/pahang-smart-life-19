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
    WHERE email LIKE '%@test.com';
    
    -- Delete auth users (this will cascade delete profiles via trigger)
    DELETE FROM auth.users WHERE email LIKE '%@test.com';
END $$;

-- Create all test users (trigger will auto-create profiles)
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
)
-- Insert into auth.users (trigger will create profiles automatically)
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
FROM test_user_data;

-- Update profiles with additional data
UPDATE public.profiles SET 
  phone = CASE email
    WHEN 'stateadmin@test.com' THEN '013-1001001'
    WHEN 'districtcoord@test.com' THEN '013-1001002'
    WHEN 'communityadmin@test.com' THEN '013-1001003'
    WHEN 'admin@test.com' THEN '013-1001004'
    WHEN 'managernorth@test.com' THEN '013-1001005'
    WHEN 'facilitymanager@test.com' THEN '013-1001006'
    WHEN 'securitynorth@test.com' THEN '013-1001007'
    WHEN 'maintenancestaff@test.com' THEN '013-1001008'
    WHEN 'resident@test.com' THEN '013-1001009'
    WHEN 'serviceprovider@test.com' THEN '013-1001010'
    WHEN 'communityleader@test.com' THEN '013-1001011'
    WHEN 'stateservicemgr@test.com' THEN '013-1001012'
  END,
  unit_number = CASE email
    WHEN 'stateadmin@test.com' THEN 'State Office'
    WHEN 'districtcoord@test.com' THEN 'District Office A'
    WHEN 'communityadmin@test.com' THEN 'Community Center'
    WHEN 'admin@test.com' THEN 'A-1-01'
    WHEN 'managernorth@test.com' THEN 'B-2-05'
    WHEN 'facilitymanager@test.com' THEN 'Facility Office'
    WHEN 'securitynorth@test.com' THEN 'Guard House A'
    WHEN 'maintenancestaff@test.com' THEN 'Maintenance Office'
    WHEN 'resident@test.com' THEN 'A-5-12'
    WHEN 'serviceprovider@test.com' THEN 'Service Center'
    WHEN 'communityleader@test.com' THEN 'D-6-09'
    WHEN 'stateservicemgr@test.com' THEN 'State Service Office'
  END,
  district_id = CASE email
    WHEN 'stateadmin@test.com' THEN '00000000-0000-0000-0000-000000000001'::uuid
    WHEN 'districtcoord@test.com' THEN '00000000-0000-0000-0000-000000000001'::uuid
    WHEN 'communityadmin@test.com' THEN '00000000-0000-0000-0000-000000000001'::uuid
    WHEN 'admin@test.com' THEN '00000000-0000-0000-0000-000000000001'::uuid
    WHEN 'managernorth@test.com' THEN '00000000-0000-0000-0000-000000000001'::uuid
    WHEN 'facilitymanager@test.com' THEN '2384b1ce-dbb1-4449-8e78-136d11dbc28e'::uuid
    WHEN 'securitynorth@test.com' THEN '00000000-0000-0000-0000-000000000001'::uuid
    WHEN 'maintenancestaff@test.com' THEN '0a1c51a3-55dd-46b2-b894-c39c6d75557c'::uuid
    WHEN 'resident@test.com' THEN '00000000-0000-0000-0000-000000000001'::uuid
    WHEN 'serviceprovider@test.com' THEN '2384b1ce-dbb1-4449-8e78-136d11dbc28e'::uuid
    WHEN 'communityleader@test.com' THEN '64a08b8c-820d-40e6-910c-0fc03c45ffe5'::uuid
    WHEN 'stateservicemgr@test.com' THEN 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'::uuid
  END
WHERE email LIKE '%@test.com';

-- Insert user roles
INSERT INTO public.user_roles (user_id, role, district_id)
SELECT 
  p.id,
  CASE p.email
    WHEN 'stateadmin@test.com' THEN 'state_admin'::user_role
    WHEN 'districtcoord@test.com' THEN 'district_coordinator'::user_role
    WHEN 'communityadmin@test.com' THEN 'community_admin'::user_role
    WHEN 'admin@test.com' THEN 'admin'::user_role
    WHEN 'managernorth@test.com' THEN 'manager'::user_role
    WHEN 'facilitymanager@test.com' THEN 'facility_manager'::user_role
    WHEN 'securitynorth@test.com' THEN 'security'::user_role
    WHEN 'maintenancestaff@test.com' THEN 'maintenance_staff'::user_role
    WHEN 'resident@test.com' THEN 'resident'::user_role
    WHEN 'serviceprovider@test.com' THEN 'service_provider'::user_role
    WHEN 'communityleader@test.com' THEN 'community_leader'::user_role
    WHEN 'stateservicemgr@test.com' THEN 'state_service_manager'::user_role
  END,
  p.district_id
FROM public.profiles p
WHERE p.email LIKE '%@test.com';