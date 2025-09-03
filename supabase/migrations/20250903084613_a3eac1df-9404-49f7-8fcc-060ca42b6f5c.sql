-- Complete the profile for user 66e142b1-bb92-4aad-9a1c-bb652061e521 with registration data
UPDATE profiles 
SET 
  district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
  community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  phone = '0198909987',
  address = 'test',
  updated_at = now()
WHERE id = '66e142b1-bb92-4aad-9a1c-bb652061e521';

-- Assign the resident role that was selected during registration
INSERT INTO enhanced_user_roles (
  user_id, 
  role, 
  district_id, 
  assigned_by, 
  is_active
) VALUES (
  '66e142b1-bb92-4aad-9a1c-bb652061e521',
  'resident',
  'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',
  '66e142b1-bb92-4aad-9a1c-bb652061e521',
  true
) ON CONFLICT (user_id, role) DO UPDATE SET
  is_active = true,
  district_id = EXCLUDED.district_id;