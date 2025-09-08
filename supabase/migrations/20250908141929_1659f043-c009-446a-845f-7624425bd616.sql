-- Create a function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, language, account_status, is_active, created_at)
  VALUES (
    NEW.id,
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

-- Create a trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Users can update their own profile during signup" ON public.profiles;
CREATE POLICY "Users can update their own profile during signup" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (id = auth.uid());