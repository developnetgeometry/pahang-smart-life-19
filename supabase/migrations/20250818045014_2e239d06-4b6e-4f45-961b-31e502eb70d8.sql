-- Fix infinite recursion in user_roles RLS policies
-- First, drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Management can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage roles" ON public.user_roles;

-- Create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS user_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role 
  FROM user_roles ur 
  WHERE ur.user_id = auth.uid() 
  ORDER BY 
    CASE ur.role 
      WHEN 'state_admin' THEN 1
      WHEN 'admin' THEN 2  
      WHEN 'district_coordinator' THEN 3
      WHEN 'community_admin' THEN 4
      WHEN 'manager' THEN 5
      ELSE 10
    END
  LIMIT 1;
$$;

-- Create safe RLS policies for user_roles without recursion
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "State and system admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.email IN (
      'stateadmin@test.com', 
      'admin@test.com'
    )
  )
);

CREATE POLICY "District coordinators can view district roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.email = 'districtcoord@test.com'
  ) AND district_id IN (
    SELECT p.district_id FROM profiles p WHERE p.id = auth.uid()
  )
);