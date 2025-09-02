-- Enable RLS and create policies for system_modules
ALTER TABLE system_modules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all modules" ON system_modules;
DROP POLICY IF EXISTS "Everyone can view active modules" ON system_modules;

-- Create policies for system_modules
CREATE POLICY "Admins can manage system modules" 
ON system_modules 
FOR ALL 
TO authenticated 
USING (
  has_enhanced_role('community_admin') OR 
  has_enhanced_role('district_coordinator') OR 
  has_enhanced_role('state_admin')
);

CREATE POLICY "Everyone can view active modules" 
ON system_modules 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- Enable RLS and create policies for role_hierarchy  
ALTER TABLE role_hierarchy ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view role hierarchy" ON role_hierarchy;

-- Create policies for role_hierarchy
CREATE POLICY "Admins can manage role hierarchy" 
ON role_hierarchy 
FOR ALL 
TO authenticated 
USING (
  has_enhanced_role('community_admin') OR 
  has_enhanced_role('district_coordinator') OR 
  has_enhanced_role('state_admin')
);

CREATE POLICY "Everyone can view role hierarchy" 
ON role_hierarchy 
FOR SELECT 
TO authenticated 
USING (true);

-- Enable RLS and create policies for role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist  
DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;

-- Create policies for role_permissions
CREATE POLICY "Admins can manage role permissions" 
ON role_permissions 
FOR ALL 
TO authenticated 
USING (
  has_enhanced_role('community_admin') OR 
  has_enhanced_role('district_coordinator') OR 
  has_enhanced_role('state_admin')
);

-- Also allow users to view permissions related to their own roles (for reference)
CREATE POLICY "Users can view their role permissions" 
ON role_permissions 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM enhanced_user_roles eur 
    WHERE eur.user_id = auth.uid() 
    AND eur.role = role_permissions.role 
    AND eur.is_active = true
  )
);