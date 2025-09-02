-- Assign resident roles to users who don't have any roles
INSERT INTO enhanced_user_roles (user_id, role, assigned_by, district_id, is_active)
SELECT 
  p.id,
  'resident'::enhanced_user_role,
  (SELECT id FROM profiles WHERE email = 'communityadmin@test.com'),
  p.district_id,
  true
FROM profiles p
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com')
AND NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur 
  WHERE eur.user_id = p.id
);

-- Verify the assignments
SELECT p.email, p.full_name, eur.role, eur.is_active
FROM profiles p 
JOIN enhanced_user_roles eur ON p.id = eur.user_id
WHERE p.email IN ('athirah@gmail.com', 'residenttest@yopmail.com')
ORDER BY p.email;