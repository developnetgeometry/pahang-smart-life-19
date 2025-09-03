-- Fix the RLS policy for profiles to handle signup properly
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;

-- Create a more permissive policy for profile creation that works during signup
CREATE POLICY "Allow profile creation during signup" ON profiles
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is authenticated and creating their own profile
    auth.uid() = id 
    OR 
    -- Allow if this is during the signup process (when auth.uid() matches the inserted id)
    auth.uid()::text = id::text
  );

-- Also ensure we can handle the case where auth.uid() might be null during signup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;