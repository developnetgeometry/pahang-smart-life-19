-- Approve key admin accounts so they can login and approve others
UPDATE public.profiles 
SET account_status = 'approved' 
WHERE email IN (
  'communityadmin@test.com', 
  'stateadmin@test.com', 
  'districtcoord@test.com',
  'resident@test.com'
) AND account_status = 'pending';