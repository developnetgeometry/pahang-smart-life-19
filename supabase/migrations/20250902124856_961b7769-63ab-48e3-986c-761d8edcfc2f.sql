-- Add community_admin role to the current user if not exists
DO $$
DECLARE 
  user_district_id UUID;
BEGIN
  -- Get user's district_id
  SELECT district_id INTO user_district_id FROM profiles WHERE id = auth.uid();
  
  -- Insert role if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM enhanced_user_roles 
    WHERE user_id = auth.uid() AND role = 'community_admin'::enhanced_user_role
  ) THEN
    INSERT INTO enhanced_user_roles (user_id, role, district_id, assigned_by, assigned_at, is_active)
    VALUES (auth.uid(), 'community_admin'::enhanced_user_role, user_district_id, auth.uid(), now(), true);
  ELSE
    -- Update existing role to be active
    UPDATE enhanced_user_roles 
    SET is_active = true, assigned_at = now()
    WHERE user_id = auth.uid() AND role = 'community_admin'::enhanced_user_role;
  END IF;
END $$;