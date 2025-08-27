-- Assign community admin role to the test user
INSERT INTO enhanced_user_roles (user_id, role, district_id, assigned_by, is_active) 
VALUES ('e804833f-7daf-495e-99e6-1dcfec050ab2', 'community_admin', '11111111-1111-1111-1111-111111111111', 'e804833f-7daf-495e-99e6-1dcfec050ab2', true);

-- Update the user's profile to have a community assigned
UPDATE profiles 
SET community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'  -- Prima Pahang community
WHERE id = 'e804833f-7daf-495e-99e6-1dcfec050ab2';