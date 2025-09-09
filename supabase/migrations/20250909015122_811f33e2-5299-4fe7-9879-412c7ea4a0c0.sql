-- Fix stateadmin user role assignment
-- First, get the user ID for stateadmin@test.com
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for stateadmin@test.com from auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'stateadmin@test.com' 
  LIMIT 1;
  
  -- If user exists, ensure they have the state_admin role
  IF admin_user_id IS NOT NULL THEN
    -- Insert or update the state_admin role
    INSERT INTO public.enhanced_user_roles (
      user_id,
      role,
      district_id,
      assigned_by,
      assigned_at,
      is_active
    ) VALUES (
      admin_user_id,
      'state_admin'::enhanced_user_role,
      NULL, -- State admin doesn't need district_id
      admin_user_id,
      now(),
      true
    )
    ON CONFLICT (user_id, role) 
    DO UPDATE SET 
      is_active = true,
      assigned_at = now();
    
    -- Deactivate any resident role for this user since they should be state_admin
    UPDATE public.enhanced_user_roles 
    SET is_active = false 
    WHERE user_id = admin_user_id 
    AND role = 'resident'::enhanced_user_role;
    
  END IF;
END $$;