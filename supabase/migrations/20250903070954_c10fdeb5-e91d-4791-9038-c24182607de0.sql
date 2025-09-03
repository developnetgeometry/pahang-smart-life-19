-- Fix duplicate district by moving all references to correct district and then removing duplicate

-- Update marketplace listings to use the correct Pahang Prima North district ID
UPDATE marketplace_listings 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'  -- correct Pahang Prima North
WHERE district_id = '00000000-0000-0000-0000-000000000001';  -- duplicate district

-- Update maintenance requests to use the correct Pahang Prima North district ID  
UPDATE maintenance_requests 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'  -- correct Pahang Prima North
WHERE district_id = '00000000-0000-0000-0000-000000000001';  -- duplicate district

-- Check for any other tables that might reference this district_id
-- Update any other potential references (comprehensive approach)
UPDATE announcements SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE communities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE facilities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE enhanced_user_roles SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE cctv_cameras SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE assets SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE community_activities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE profiles SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Now we can safely remove the duplicate district entry
DELETE FROM districts 
WHERE id = '00000000-0000-0000-0000-000000000001' 
  AND name = 'Pahang Prima North';