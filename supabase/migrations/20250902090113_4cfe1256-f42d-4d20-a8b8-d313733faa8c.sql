-- Simply insert the missing role for the user who has NULL role
INSERT INTO enhanced_user_roles (user_id, role, is_active)
SELECT '1fb71ba7-dbb8-4c09-a9e7-77c2eb257d16', 'resident', true
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles 
  WHERE user_id = '1fb71ba7-dbb8-4c09-a9e7-77c2eb257d16' 
  AND role = 'resident'
);

-- Ensure all users have community_id in profiles
UPDATE profiles 
SET community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
WHERE community_id IS NULL 
AND email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com');

-- Verify the fix
SELECT 
  p.email, 
  p.district_id,
  p.community_id,
  eur.role
FROM profiles p
LEFT JOIN enhanced_user_roles eur ON p.id = eur.user_id AND eur.is_active = true
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com');