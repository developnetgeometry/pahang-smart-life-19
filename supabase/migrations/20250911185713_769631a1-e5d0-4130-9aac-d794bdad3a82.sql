-- Step 1: Create or update RLS policies for guest role assignment

-- Policy to allow admins to assign guest roles
DROP POLICY IF EXISTS "Admins can assign guest roles" ON enhanced_user_roles;
CREATE POLICY "Admins can assign guest roles" 
ON enhanced_user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_enhanced_role('state_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role)
);

-- Policy to allow admins to create guest profiles
DROP POLICY IF EXISTS "Admins can create guest profiles" ON profiles;
CREATE POLICY "Admins can create guest profiles" 
ON profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_enhanced_role('state_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role)
);

-- Policy to allow admins to update guest profiles  
DROP POLICY IF EXISTS "Admins can update guest profiles" ON profiles;
CREATE POLICY "Admins can update guest profiles" 
ON profiles 
FOR UPDATE 
TO authenticated
USING (
  has_enhanced_role('state_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role)
);

-- Add guest access expiration validation trigger
CREATE OR REPLACE FUNCTION validate_guest_access_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate for users with guest role
  IF EXISTS (
    SELECT 1 FROM enhanced_user_roles 
    WHERE user_id = NEW.id AND role = 'guest'::enhanced_user_role
  ) THEN
    -- Ensure access_expires_at is set and in the future for guest users
    IF NEW.access_expires_at IS NULL OR NEW.access_expires_at <= NOW() THEN
      RAISE EXCEPTION 'Guest users must have a valid future expiration date';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for guest expiration validation
DROP TRIGGER IF EXISTS trigger_validate_guest_expiration ON profiles;
CREATE TRIGGER trigger_validate_guest_expiration
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_guest_access_expiration();

-- Function to check if guest access has expired
CREATE OR REPLACE FUNCTION is_guest_access_expired(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT access_expires_at <= NOW()
      FROM profiles p
      JOIN enhanced_user_roles eur ON eur.user_id = p.id
      WHERE p.id = is_guest_access_expired.user_id 
      AND eur.role = 'guest'::enhanced_user_role
    ),
    false
  );
$$;