-- Assign Ilham to Encik Lim Chee Kong's district and community
UPDATE profiles 
SET 
  district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc',  -- Pahang Prima North
  community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Prima Pahang
  updated_at = now()
WHERE email LIKE '%ilham%' 
  AND (district_id IS NULL OR community_id IS NULL);