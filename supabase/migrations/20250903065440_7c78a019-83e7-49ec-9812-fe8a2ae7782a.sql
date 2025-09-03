-- Update remaining tables that reference the duplicate district ID
UPDATE facilities 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE access_cards 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE access_logs 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE advertisements 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE audit_logs 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE work_orders 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE visitor_registrations 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE service_requests 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE notifications 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';