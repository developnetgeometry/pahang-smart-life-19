-- Fix dual role assignment and add missing guest role to hierarchy

-- First, remove the conflicting guest role from tr1 user (should only be resident)  
DELETE FROM enhanced_user_roles 
WHERE user_id = 'a7a43e90-0e21-4a1b-83c4-f238a22ae9d1' 
AND role = 'guest'::enhanced_user_role;

-- Add guest role to role_hierarchy if it doesn't exist (using limited_access like resident)
INSERT INTO role_hierarchy (role, level, permission_level, display_name, description, color_code)
VALUES (
  'guest'::enhanced_user_role,
  0, -- Lowest level, below resident
  'limited_access'::permission_level,
  'Guest',
  'Temporary access user with limited permissions',
  '#6B7280' -- Gray color for guests
)
ON CONFLICT (role) DO NOTHING;

-- Create a function to prevent conflicting role assignments
CREATE OR REPLACE FUNCTION prevent_conflicting_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent assigning both resident and guest roles to the same user
  IF NEW.role = 'resident'::enhanced_user_role THEN
    -- Remove any existing guest role when assigning resident
    DELETE FROM enhanced_user_roles 
    WHERE user_id = NEW.user_id 
    AND role = 'guest'::enhanced_user_role;
  ELSIF NEW.role = 'guest'::enhanced_user_role THEN
    -- Prevent guest assignment if user already has resident role
    IF EXISTS (
      SELECT 1 FROM enhanced_user_roles 
      WHERE user_id = NEW.user_id 
      AND role = 'resident'::enhanced_user_role 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Cannot assign guest role to user who already has resident role';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce role conflicts prevention
DROP TRIGGER IF EXISTS trigger_prevent_conflicting_roles ON enhanced_user_roles;
CREATE TRIGGER trigger_prevent_conflicting_roles
  BEFORE INSERT ON enhanced_user_roles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_conflicting_roles();

-- Add logging for role changes to help debug future issues
CREATE OR REPLACE FUNCTION log_enhanced_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name, action, record_id, new_values, user_id, timestamp
    ) VALUES (
      'enhanced_user_roles', 'role_assigned', NEW.user_id, 
      jsonb_build_object('role', NEW.role, 'assigned_by', NEW.assigned_by),
      NEW.assigned_by, NOW()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name, action, record_id, old_values, new_values, user_id, timestamp
    ) VALUES (
      'enhanced_user_roles', 'role_updated', NEW.user_id,
      jsonb_build_object('old_role', OLD.role, 'old_active', OLD.is_active),
      jsonb_build_object('new_role', NEW.role, 'new_active', NEW.is_active),
      NEW.assigned_by, NOW()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name, action, record_id, old_values, timestamp
    ) VALUES (
      'enhanced_user_roles', 'role_removed', OLD.user_id,
      jsonb_build_object('role', OLD.role),
      NOW()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS trigger_log_enhanced_role_changes ON enhanced_user_roles;
CREATE TRIGGER trigger_log_enhanced_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON enhanced_user_roles
  FOR EACH ROW
  EXECUTE FUNCTION log_enhanced_role_changes();