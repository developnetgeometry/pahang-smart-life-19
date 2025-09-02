-- Update profiles in batches to avoid trigger issues
-- First, let's update just the community_id for users who don't have it
UPDATE profiles 
SET community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE community_id IS NULL OR community_id != 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Update district_id for users who don't have the correct one  
UPDATE profiles 
SET district_id = '00000000-0000-0000-0000-000000000001'
WHERE district_id IS NULL OR district_id != '00000000-0000-0000-0000-000000000001';

-- Update enhanced_user_roles district_id
UPDATE enhanced_user_roles 
SET district_id = '00000000-0000-0000-0000-000000000001'
WHERE district_id IS NULL OR district_id != '00000000-0000-0000-0000-000000000001';