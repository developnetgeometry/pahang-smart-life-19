-- Fix the trigger to include the missing user_id column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  signup_flow TEXT;
  role_to_assign enhanced_user_role;
BEGIN
  -- Get the signup_flow from metadata, default to 'resident'
  signup_flow := COALESCE(NEW.raw_user_meta_data ->> 'signup_flow', 'resident');
  
  -- Determine role based on signup flow
  IF signup_flow = 'service_provider' THEN
    role_to_assign := 'service_provider'::enhanced_user_role;
  ELSE
    role_to_assign := 'resident'::enhanced_user_role;
  END IF;

  -- Create profile with all required columns
  INSERT INTO public.profiles (
    id,
    user_id, -- Add the missing user_id column
    full_name,
    email,
    mobile_no,
    district_id,
    community_id,
    address,
    language,
    pdpa_declare,
    registration_status
  ) VALUES (
    NEW.id,
    NEW.id, -- user_id should reference the auth user id
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'mobile_no',
    (NEW.raw_user_meta_data ->> 'district_id')::uuid,
    (NEW.raw_user_meta_data ->> 'community_id')::uuid,
    NEW.raw_user_meta_data ->> 'address',
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'ms'),
    COALESCE((NEW.raw_user_meta_data ->> 'pdpa_declare')::boolean, false),
    false
  );

  -- Assign role in enhanced_user_roles
  INSERT INTO public.enhanced_user_roles (
    user_id,
    role,
    district_id,
    assigned_by,
    is_active
  ) VALUES (
    NEW.id,
    role_to_assign,
    (NEW.raw_user_meta_data ->> 'district_id')::uuid,
    NEW.id,
    true
  );

  -- Create service provider application if signup_flow is service_provider
  IF signup_flow = 'service_provider' THEN
    INSERT INTO public.service_provider_applications (
      applicant_id,
      district_id,
      business_name,
      business_type,
      business_description,
      contact_person,
      contact_phone,
      contact_email,
      business_address,
      experience_years,
      status
    ) VALUES (
      NEW.id,
      (NEW.raw_user_meta_data ->> 'district_id')::uuid,
      NEW.raw_user_meta_data ->> 'business_name',
      NEW.raw_user_meta_data ->> 'business_type',
      COALESCE(NEW.raw_user_meta_data ->> 'business_description', 'Service provider registered via signup'),
      NEW.raw_user_meta_data ->> 'full_name',
      COALESCE(NEW.raw_user_meta_data ->> 'mobile_no', NEW.raw_user_meta_data ->> 'contact_phone'),
      NEW.email,
      NEW.raw_user_meta_data ->> 'address',
      COALESCE((NEW.raw_user_meta_data ->> 'experience_years')::integer, 0),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$;