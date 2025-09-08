-- Update handle_new_user trigger to support separate signup flows and roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  signup_flow_type TEXT;
  assigned_role enhanced_user_role;
BEGIN
  -- Get signup flow type from metadata
  signup_flow_type := NEW.raw_user_meta_data ->> 'signup_flow';
  
  -- Determine role based on signup flow
  IF signup_flow_type = 'service_provider' THEN
    assigned_role := 'service_provider';
  ELSE
    assigned_role := 'resident'; -- Default for residents and any other flow
  END IF;

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

  -- Assign role based on signup flow
  INSERT INTO public.enhanced_user_roles (user_id, role, is_active, assigned_at, district_id)
  VALUES (
    NEW.id, 
    assigned_role, 
    true, 
    NOW(),
    (NEW.raw_user_meta_data ->> 'district_id')::uuid
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  -- For service providers, create minimal application record
  IF signup_flow_type = 'service_provider' THEN
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
      status,
      application_date
    )
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data ->> 'district_id')::uuid,
      NEW.raw_user_meta_data ->> 'business_name',
      NEW.raw_user_meta_data ->> 'business_type',
      COALESCE(NEW.raw_user_meta_data ->> 'business_description', 'Service provider registered via signup'),
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'mobile_no',
      NEW.email,
      NEW.raw_user_meta_data ->> 'address',
      COALESCE((NEW.raw_user_meta_data ->> 'experience_years')::integer, 0),
      'pending',
      NOW()
    )
    ON CONFLICT (applicant_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;