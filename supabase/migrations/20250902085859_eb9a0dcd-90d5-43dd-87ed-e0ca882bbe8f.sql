-- Ensure all users have enhanced_user_roles entries
INSERT INTO enhanced_user_roles (user_id, role, is_active, created_at, updated_at)
SELECT p.id, 'resident'::enhanced_user_role, true, now(), now()
FROM profiles p 
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com')
AND NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur 
  WHERE eur.user_id = p.id AND eur.role = 'resident'::enhanced_user_role
);

-- Ensure all users are connected to the same community
INSERT INTO user_communities (user_id, community_id, joined_at, is_active)
SELECT p.id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, now(), true
FROM profiles p 
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com')
AND NOT EXISTS (
  SELECT 1 FROM user_communities uc 
  WHERE uc.user_id = p.id AND uc.community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
);

-- Verify all users now have proper setup
SELECT 
  p.email, 
  p.district_id,
  eur.role,
  uc.community_id
FROM profiles p
LEFT JOIN enhanced_user_roles eur ON p.id = eur.user_id AND eur.is_active = true
LEFT JOIN user_communities uc ON p.id = uc.user_id AND uc.is_active = true
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com');