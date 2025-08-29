-- Fix district ID mismatch - update resident to be in same district as community admin
UPDATE profiles 
SET district_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'resident@test.com';