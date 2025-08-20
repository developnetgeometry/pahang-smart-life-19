-- Fix the has_role function to work with the correct enum types
DROP FUNCTION IF EXISTS public.has_role(user_role);

-- Update the has_role function to use the correct enum
CREATE OR REPLACE FUNCTION public.has_role(check_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = check_role
  );
$function$;

-- Also ensure users have proper profile data with district_id
-- Create a test user profile if needed
INSERT INTO profiles (id, email, full_name, district_id) 
VALUES (
  auth.uid(),
  'test@example.com',
  'Test User',
  (SELECT id FROM districts LIMIT 1)
) ON CONFLICT (id) DO UPDATE SET
  district_id = COALESCE(profiles.district_id, (SELECT id FROM districts LIMIT 1));

-- Create a test user role
INSERT INTO user_roles (user_id, role, district_id)
VALUES (
  auth.uid(),
  'resident',
  (SELECT id FROM districts LIMIT 1)
) ON CONFLICT DO NOTHING;