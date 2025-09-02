-- Just fix missing user roles first
INSERT INTO enhanced_user_roles (user_id, role, is_active)
SELECT p.id, 'resident'::enhanced_user_role, true
FROM profiles p 
WHERE p.email IN ('athirah2@gmail.com')
AND NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur 
  WHERE eur.user_id = p.id AND eur.role = 'resident'::enhanced_user_role AND eur.is_active = true
);

-- Verify all users now have proper setup
SELECT 
  p.email, 
  p.district_id,
  eur.role as enhanced_role
FROM profiles p
LEFT JOIN enhanced_user_roles eur ON p.id = eur.user_id AND eur.is_active = true
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com', 'resident@test.com')
ORDER BY p.email;