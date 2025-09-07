-- Fix the function security issue by setting search_path properly
CREATE OR REPLACE FUNCTION public.is_user_account_approved(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT account_status = 'approved' 
  FROM public.profiles 
  WHERE id = user_id;
$$;