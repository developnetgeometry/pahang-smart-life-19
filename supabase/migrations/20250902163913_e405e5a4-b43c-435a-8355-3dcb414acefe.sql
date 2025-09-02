-- Grant facility_manager role to test user
INSERT INTO enhanced_user_roles (user_id, role, assigned_by, district_id, is_active)
SELECT 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'facility_manager'::enhanced_user_role,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  (SELECT district_id FROM profiles WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  true
ON CONFLICT (user_id, role) DO UPDATE SET
  is_active = true,
  assigned_by = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;