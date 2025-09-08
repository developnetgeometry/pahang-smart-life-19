-- Fix signup data saving by updating the trigger to handle all signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with all signup data from metadata
  INSERT INTO public.profiles (
    id, 
    user_id, 
    email, 
    full_name, 
    phone,
    district_id,
    community_id,
    address,
    language,
    pdpa_declare,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'mobile_no',
    (NEW.raw_user_meta_data ->> 'district_id')::uuid,
    (NEW.raw_user_meta_data ->> 'community_id')::uuid,
    NEW.raw_user_meta_data ->> 'address',
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'ms'),
    (NEW.raw_user_meta_data ->> 'pdpa_declare')::boolean,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-assign resident role
  INSERT INTO public.enhanced_user_roles (user_id, role, is_active, assigned_at)
  VALUES (NEW.id, 'resident', true, NOW())
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;