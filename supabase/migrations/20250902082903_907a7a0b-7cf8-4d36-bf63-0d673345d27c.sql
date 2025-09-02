-- Assign unassigned users to the test community so they can see enabled modules
UPDATE profiles 
SET community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE community_id IS NULL 
AND email IN (
  'athirah@gmail.com',
  'athirah2@gmail.com', 
  'athirah2@com',
  'keyboardmahal02@gmail.com',
  'residenttest@yopmail.com'
);

-- Verify the update
SELECT email, full_name, community_id 
FROM profiles 
WHERE email IN (
  'athirah@gmail.com',
  'athirah2@gmail.com', 
  'athirah2@com',
  'keyboardmahal02@gmail.com',
  'residenttest@yopmail.com'
);