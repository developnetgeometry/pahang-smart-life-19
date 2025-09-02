-- Disable modules that facility managers should not see in their sidebar
UPDATE community_features 
SET is_enabled = false, 
    notes = 'Disabled for facility manager - not part of their role responsibilities'
WHERE community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' 
  AND module_name IN ('marketplace', 'discussions', 'events', 'cctv');