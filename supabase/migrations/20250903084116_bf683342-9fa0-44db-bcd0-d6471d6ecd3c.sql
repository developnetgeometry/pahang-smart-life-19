-- Fix RLS policies for profiles table to allow user registration
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Allow users to insert their own profile during registration
CREATE POLICY "Enable insert for users based on user_id" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Enable read access for own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Also ensure the enhanced_user_roles policy allows self-assignment
DROP POLICY IF EXISTS "Users can self-assign resident or service provider roles" ON enhanced_user_roles;

CREATE POLICY "Enable self role assignment during registration" ON enhanced_user_roles
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    role IN ('resident', 'service_provider') AND
    assigned_by = auth.uid()
  );