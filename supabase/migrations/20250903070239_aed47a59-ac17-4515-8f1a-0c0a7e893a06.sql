-- Final attempt to remove the duplicate district entry
DELETE FROM districts 
WHERE id = '00000000-0000-0000-0000-000000000001' 
AND name = 'Pahang Prima North';