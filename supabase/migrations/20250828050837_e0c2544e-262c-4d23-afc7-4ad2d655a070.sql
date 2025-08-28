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