-- Remove the duplicate Pahang Prima North district entry
-- The duplicate has ID '00000000-0000-0000-0000-000000000001' and has no associated user data
-- The correct entry has ID 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' and has 11 users

DELETE FROM districts 
WHERE id = '00000000-0000-0000-0000-000000000001' 
  AND name = 'Pahang Prima North';