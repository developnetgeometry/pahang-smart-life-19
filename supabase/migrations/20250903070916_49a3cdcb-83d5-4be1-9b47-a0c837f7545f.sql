-- Fix duplicate district by moving marketplace listings to correct district and then removing duplicate

-- First, update marketplace listings to use the correct Pahang Prima North district ID
UPDATE marketplace_listings 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'  -- correct Pahang Prima North
WHERE district_id = '00000000-0000-0000-0000-000000000001';  -- duplicate district

-- Now we can safely remove the duplicate district entry
DELETE FROM districts 
WHERE id = '00000000-0000-0000-0000-000000000001' 
  AND name = 'Pahang Prima North';