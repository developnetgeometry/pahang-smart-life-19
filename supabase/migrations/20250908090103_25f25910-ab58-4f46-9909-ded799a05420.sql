-- Check if enhanced_user_roles table has appropriate RLS policies for registration
-- Add policy to allow users to assign themselves roles during registration

-- Create policy to allow users to insert their own role during registration
-- Only allow self-assignment of basic roles during registration
CREATE POLICY "Users can assign themselves roles during registration" 
ON enhanced_user_roles 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND assigned_by = auth.uid()
  AND role IN ('resident', 'service_provider', 'spouse', 'tenant')
);

-- Also add a policy to allow users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON enhanced_user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Add policy for admins to manage all roles
CREATE POLICY "Admins can manage all user roles" 
ON enhanced_user_roles 
FOR ALL 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  OR has_enhanced_role('district_coordinator'::enhanced_user_role) 
  OR has_enhanced_role('state_admin'::enhanced_user_role)
);