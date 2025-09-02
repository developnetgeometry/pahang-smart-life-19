-- Create get_user_district function to return the current user's district
CREATE OR REPLACE FUNCTION public.get_user_district()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT district_id FROM profiles WHERE id = auth.uid();
$$;

-- Create get_user_community function to return the current user's community  
CREATE OR REPLACE FUNCTION public.get_user_community()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT community_id FROM profiles WHERE id = auth.uid();
$$;