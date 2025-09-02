-- Fix missing user roles first
INSERT INTO enhanced_user_roles (user_id, role, is_active)
SELECT p.id, 'resident'::enhanced_user_role, true
FROM profiles p 
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com')
AND NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur 
  WHERE eur.user_id = p.id AND eur.role = 'resident'::enhanced_user_role AND eur.is_active = true
);

-- Update all users to be in the same community via profiles table
UPDATE profiles 
SET community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
WHERE email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com')
AND (community_id IS NULL OR community_id != 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid);

-- Verify final setup
SELECT 
  p.email, 
  p.district_id,
  p.community_id,
  eur.role as enhanced_role
FROM profiles p
LEFT JOIN enhanced_user_roles eur ON p.id = eur.user_id AND eur.is_active = true
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com')
ORDER BY p.email;