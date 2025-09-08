-- Clean up all conflicting RLS policies on enhanced_user_roles table
-- Drop all existing policies to start fresh

DROP POLICY IF EXISTS "Admin role management" ON enhanced_user_roles;
DROP POLICY IF EXISTS "Admins can assign roles to users" ON enhanced_user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON enhanced_user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON enhanced_user_roles;
DROP POLICY IF EXISTS "Allow self role assignment during registration" ON enhanced_user_roles;
DROP POLICY IF EXISTS "Enable self role assignment during registration" ON enhanced_user_roles;
DROP POLICY IF EXISTS "High-level admins can manage roles" ON enhanced_user_roles;
DROP POLICY IF EXISTS "Users can self-assign resident role" ON enhanced_user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON enhanced_user_roles;

-- Create simple and clear policies
-- Allow users to view their own roles
CREATE POLICY "view_own_roles" 
ON enhanced_user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow users to insert their own role during registration (basic roles only)
CREATE POLICY "self_assign_basic_roles" 
ON enhanced_user_roles 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND assigned_by = auth.uid()
  AND role IN ('resident', 'service_provider', 'spouse', 'tenant')
);

-- Allow admins to manage all roles
CREATE POLICY "admin_manage_all_roles" 
ON enhanced_user_roles 
FOR ALL 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  OR has_enhanced_role('district_coordinator'::enhanced_user_role) 
  OR has_enhanced_role('state_admin'::enhanced_user_role)
);