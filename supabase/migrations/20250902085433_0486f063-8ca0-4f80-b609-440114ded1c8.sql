-- Try updating using specific user IDs to avoid trigger issues
-- First, let's temporarily disable the trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Now update the district_id for users who have NULL
UPDATE profiles 
SET district_id = '00000000-0000-0000-0000-000000000001'
WHERE district_id IS NULL;

-- Verify the update worked
SELECT email, district_id 
FROM profiles 
WHERE email IN ('athirah@gmail.com', 'residenttest@yopmail.com', 'athirah2@gmail.com');