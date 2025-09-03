-- Update all tables that reference the duplicate district ID
-- Update profiles
UPDATE profiles 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Update enhanced_user_roles
UPDATE enhanced_user_roles 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Update announcements
UPDATE announcements 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Update any other tables that might reference this district
UPDATE complaints 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE community_activities 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE cctv_cameras 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE assets 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE chat_rooms 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';