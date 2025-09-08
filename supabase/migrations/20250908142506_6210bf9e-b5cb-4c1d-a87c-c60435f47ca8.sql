-- Fix the handle_new_user function to use correct column mapping
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, language, account_status, is_active, created_at)
  VALUES (
    NEW.id,  -- Use NEW.id for user_id column
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    'ms',
    'pending',
    true,
    NOW()
  );
  RETURN NEW;
END;
$$;