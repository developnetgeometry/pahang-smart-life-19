-- Assign all users to the same community and district for full connectivity
-- Using the district that the community admin and resident@test.com are already in
UPDATE profiles 
SET 
  community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  district_id = '00000000-0000-0000-0000-000000000001'
WHERE community_id IS NULL OR district_id IS NULL OR district_id != '00000000-0000-0000-0000-000000000001';

-- Also update the enhanced_user_roles to use the same district_id
UPDATE enhanced_user_roles 
SET district_id = '00000000-0000-0000-0000-000000000001'
WHERE district_id IS NULL OR district_id != '00000000-0000-0000-0000-000000000001';

-- Verify the updates
SELECT email, full_name, community_id, district_id 
FROM profiles 
WHERE email IN (
  'resident@test.com',
  'athirah@gmail.com', 
  'residenttest@yopmail.com',
  'communityadmin@test.com'
)
ORDER BY email;