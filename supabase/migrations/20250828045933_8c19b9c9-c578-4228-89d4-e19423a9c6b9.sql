-- Add new roles for spouse and tenant accounts
ALTER TYPE enhanced_user_role ADD VALUE IF NOT EXISTS 'spouse';
ALTER TYPE enhanced_user_role ADD VALUE IF NOT EXISTS 'tenant';

-- Create household_accounts table to manage linked accounts
CREATE TABLE public.household_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_account_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  linked_account_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('spouse', 'tenant')),
  permissions JSONB DEFAULT '{"marketplace": false, "bookings": true, "announcements": true, "complaints": true, "discussions": false}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  
  -- Ensure no duplicate relationships
  UNIQUE(primary_account_id, linked_account_id),
  -- Ensure primary account cannot link to itself
  CHECK (primary_account_id != linked_account_id),
  -- Ensure only one spouse per primary account
  UNIQUE(primary_account_id, relationship_type) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS on household_accounts
ALTER TABLE household_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for household_accounts
CREATE POLICY "Primary users can manage their household accounts"
ON household_accounts
FOR ALL
TO authenticated
USING (primary_account_id = auth.uid() OR linked_account_id = auth.uid())
WITH CHECK (primary_account_id = auth.uid());

CREATE POLICY "Linked users can view their household connection"
ON household_accounts
FOR SELECT
TO authenticated
USING (linked_account_id = auth.uid());

-- Function to get primary account for linked users
CREATE OR REPLACE FUNCTION get_primary_account_id(check_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT primary_account_id FROM household_accounts WHERE linked_account_id = check_user_id AND is_active = true),
    check_user_id
  );
$$;

-- Function to check if user has household permission
CREATE OR REPLACE FUNCTION has_household_permission(permission_name TEXT, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT (permissions->>permission_name)::boolean 
     FROM household_accounts 
     WHERE linked_account_id = check_user_id AND is_active = true),
    true -- Primary accounts have all permissions
  );
$$;

-- Add trigger to automatically assign spouse/tenant role when linked account is created
CREATE OR REPLACE FUNCTION assign_household_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Assign the appropriate role to the linked account
  INSERT INTO enhanced_user_roles (user_id, role, assigned_by, district_id, is_active)
  SELECT 
    NEW.linked_account_id,
    CASE 
      WHEN NEW.relationship_type = 'spouse' THEN 'spouse'::enhanced_user_role
      WHEN NEW.relationship_type = 'tenant' THEN 'tenant'::enhanced_user_role
    END,
    NEW.primary_account_id,
    (SELECT district_id FROM profiles WHERE id = NEW.primary_account_id),
    NEW.is_active
  ON CONFLICT (user_id, role) DO UPDATE SET
    is_active = NEW.is_active,
    assigned_by = NEW.primary_account_id;
    
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_household_role_trigger
  AFTER INSERT OR UPDATE ON household_accounts
  FOR EACH ROW
  EXECUTE FUNCTION assign_household_role();

-- Update role hierarchy to include new roles
INSERT INTO role_hierarchy (role, level, permission_level, display_name, description, color_code)
VALUES 
  ('spouse', 2, 'standard_access', 'Spouse', 'Spouse of primary resident with limited access', '#8B5CF6'),
  ('tenant', 1, 'limited_access', 'Tenant', 'Tenant with restricted access to community features', '#6B7280')
ON CONFLICT (role) DO UPDATE SET
  level = EXCLUDED.level,
  permission_level = EXCLUDED.permission_level,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  color_code = EXCLUDED.color_code;