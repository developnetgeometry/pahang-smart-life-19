-- Fix the registration issue by creating proper RLS policy for enhanced_user_roles
-- Drop existing restrictive policies and add permissive ones for registration

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can assign themselves roles during registration" ON enhanced_user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON enhanced_user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON enhanced_user_roles;

-- Create policy to allow users to insert their own role during registration
-- This allows self-assignment of basic roles during registration
CREATE POLICY "Allow self role assignment during registration" 
ON enhanced_user_roles 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND assigned_by = auth.uid()
  AND role IN ('resident', 'service_provider', 'spouse', 'tenant')
);

-- Allow users to view their own roles
CREATE POLICY "Users can view own roles" 
ON enhanced_user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow admins to manage all roles
CREATE POLICY "Admin role management" 
ON enhanced_user_roles 
FOR ALL 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  OR has_enhanced_role('district_coordinator'::enhanced_user_role) 
  OR has_enhanced_role('state_admin'::enhanced_user_role)
);