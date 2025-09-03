-- Fix the district assignment for Prima Pahang community
-- Moving it from Kuantan District to Pahang Prima North where Encik Lim Chee Kong is assigned

UPDATE communities 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'  -- Pahang Prima North
WHERE name = 'Prima Pahang' 
AND id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';