-- Fix the handle_new_user trigger to use user_id instead of id for profiles table
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

  -- Debug: Insert a test log to see if trigger runs
  INSERT INTO public.audit_logs (
    table_name,
    action,
    record_id,
    new_values,
    timestamp
  ) VALUES (
    'trigger_debug',
    'handle_new_user_called',
    NEW.id,
    jsonb_build_object(
      'signup_flow', signup_flow,
      'role_to_assign', role_to_assign,
      'email', NEW.email
    ),
    now()
  );

  -- Create profile using correct column names (user_id is required, not id)
  INSERT INTO public.profiles (
    user_id,
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO public.audit_logs (
      table_name,
      action,
      record_id,
      new_values,
      timestamp
    ) VALUES (
      'trigger_error',
      'handle_new_user_failed',
      NEW.id,
      jsonb_build_object(
        'error_message', SQLERRM,
        'error_state', SQLSTATE,
        'signup_flow', signup_flow
      ),
      now()
    );
    -- Re-raise the error
    RAISE;
END;
$$;
