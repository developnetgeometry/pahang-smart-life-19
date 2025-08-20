-- Update some facilities to match the user district so they can see them
UPDATE facilities 
SET district_id = '00000000-0000-0000-0000-000000000001' 
WHERE name IN ('Kolam Renang Pahang Prima', 'Gymnasium Pahang Prima', 'Surau Pahang Prima');