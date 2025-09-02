-- Fix the missing user role without using non-existent columns
INSERT INTO enhanced_user_roles (user_id, role, is_active)
VALUES ('1fb71ba7-dbb8-4c09-a9e7-77c2eb257d16', 'resident', true)
ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;

-- Ensure all users are in the same community
INSERT INTO user_communities (user_id, community_id, joined_at, is_active)
SELECT p.id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, now(), true
FROM profiles p 
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com')
ON CONFLICT (user_id, community_id) DO UPDATE SET is_active = true;

-- Update profiles to ensure all have community_id set
UPDATE profiles 
SET community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
WHERE id IN (
  SELECT id FROM profiles 
  WHERE email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com')
);

-- Verify final state
SELECT 
  p.email, 
  p.district_id,
  p.community_id,
  eur.role as enhanced_role,
  uc.community_id as user_community
FROM profiles p
LEFT JOIN enhanced_user_roles eur ON p.id = eur.user_id AND eur.is_active = true
LEFT JOIN user_communities uc ON p.id = uc.user_id AND uc.is_active = true
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com');