-- Final comprehensive fix for duplicate district - update ALL references

-- Update all tables that reference the duplicate district ID to use the correct one
-- Marketplace listings
UPDATE marketplace_listings 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' 
WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Maintenance requests
UPDATE maintenance_requests 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' 
WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Community groups (this was missing in previous attempts)
UPDATE community_groups 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' 
WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Update all other potential references
UPDATE announcements SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE communities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE facilities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE enhanced_user_roles SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE cctv_cameras SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE assets SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE community_activities SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE profiles SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE work_orders SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE service_requests SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE notifications SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE complaints SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE inventory_items SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE financial_transactions SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE panic_alerts SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';
UPDATE advertisements SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Finally, delete the duplicate district
DELETE FROM districts 
WHERE id = '00000000-0000-0000-0000-000000000001' 
  AND name = 'Pahang Prima North';