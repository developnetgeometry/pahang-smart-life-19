-- Improve handle_new_user trigger with better error handling and duplicate prevention
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

  -- Check if profile already exists (defensive check)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    -- Profile already exists, skip creation but log the attempt
    INSERT INTO public.audit_logs (
      table_name,
      action,
      record_id,
      new_values,
      timestamp
    ) VALUES (
      'handle_new_user',
      'profile_already_exists',
      NEW.id,
      jsonb_build_object(
        'signup_flow', signup_flow,
        'email', NEW.email
      ),
      now()
    );
    RETURN NEW;
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

  -- Assign role in enhanced_user_roles (with duplicate prevention)
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
  ) ON CONFLICT (user_id, role) DO UPDATE SET
    is_active = true,
    district_id = EXCLUDED.district_id,
    assigned_by = EXCLUDED.assigned_by;

  -- Create service provider application if signup_flow is service_provider
  IF signup_flow = 'service_provider' THEN
    -- Check if application already exists
    IF NOT EXISTS (SELECT 1 FROM public.service_provider_applications WHERE applicant_id = NEW.id) THEN
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
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error with more detailed information
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
        'signup_flow', signup_flow,
        'email', NEW.email,
        'metadata', NEW.raw_user_meta_data
      ),
      now()
    );
    
    -- Don't re-raise the error to prevent blocking user signup
    -- Instead, return NEW to allow the auth process to complete
    -- The error will be logged for investigation
    RETURN NEW;
END;
$$;