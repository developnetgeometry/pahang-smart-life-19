-- Enable RLS on tables if not already enabled
ALTER TABLE system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_hierarchy ENABLE ROW LEVEL SECURITY;  
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create simple view policies for non-admin users to see basic data
DO $$
BEGIN
    -- Create policy for everyone to view active modules (if it doesn't exist)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'system_modules' 
        AND policyname = 'Everyone can view active modules'
    ) THEN
        CREATE POLICY "Everyone can view active modules" 
        ON system_modules 
        FOR SELECT 
        TO authenticated 
        USING (is_active = true);
    END IF;

    -- Create policy for everyone to view role hierarchy (if it doesn't exist)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'role_hierarchy' 
        AND policyname = 'Everyone can view role hierarchy'
    ) THEN
        CREATE POLICY "Everyone can view role hierarchy" 
        ON role_hierarchy 
        FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;

    -- Create policy for users to view their own role permissions (if it doesn't exist)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'role_permissions' 
        AND policyname = 'Users can view their role permissions'
    ) THEN
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
    END IF;
END $$;