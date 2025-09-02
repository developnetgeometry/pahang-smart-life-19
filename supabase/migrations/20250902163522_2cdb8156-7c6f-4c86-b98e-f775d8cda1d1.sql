-- Remove facility modules from community control since they are now role-based
DELETE FROM community_features 
WHERE community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' 
AND module_name IN ('facilities', 'bookings');