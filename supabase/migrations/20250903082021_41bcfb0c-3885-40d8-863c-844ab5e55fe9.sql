-- Fix RLS policies to allow user registration

-- Allow users to insert their own profile during registration
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to self-assign resident role during registration  
DROP POLICY IF EXISTS "Users can self-assign resident role" ON public.enhanced_user_roles;
CREATE POLICY "Users can self-assign resident role" 
ON public.enhanced_user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('resident', 'service_provider')
  AND assigned_by = auth.uid()
);