
-- 1) Fix the signup trigger to create a valid profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert both id and user_id to satisfy PK and FK/unique constraints
  INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and points to the corrected function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) Allow users to self-assign the 'resident' role only
-- (The enhanced_user_role enum includes 'resident' but not 'spouse' or 'tenant')
DROP POLICY IF EXISTS "Users can self-assign resident role" ON public.enhanced_user_roles;
CREATE POLICY "Users can self-assign resident role"
  ON public.enhanced_user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'resident'
  );
