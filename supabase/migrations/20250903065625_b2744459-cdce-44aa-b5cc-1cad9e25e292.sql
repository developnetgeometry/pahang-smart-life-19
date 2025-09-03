-- Update facilities table and any other remaining references
UPDATE facilities 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Check and update any other tables that might reference districts
UPDATE advertisements 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE access_cards 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE access_logs 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE work_orders 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Now safely remove the duplicate district entry
DELETE FROM districts 
WHERE id = '00000000-0000-0000-0000-000000000001' 
AND name = 'Pahang Prima North';