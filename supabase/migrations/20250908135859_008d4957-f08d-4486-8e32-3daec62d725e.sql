-- Create a function to handle service provider application creation during signup
CREATE OR REPLACE FUNCTION create_service_provider_application_on_signup(
  p_applicant_id UUID,
  p_district_id UUID,
  p_business_name TEXT,
  p_business_type TEXT,
  p_contact_person TEXT,
  p_contact_phone TEXT,
  p_contact_email TEXT,
  p_business_address TEXT,
  p_experience_years INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_id UUID;
BEGIN
  -- Insert the service provider application
  INSERT INTO service_provider_applications (
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
    p_applicant_id,
    p_district_id,
    p_business_name,
    p_business_type,
    'Service provider registered via signup',
    p_contact_person,
    p_contact_phone,
    p_contact_email,
    p_business_address,
    p_experience_years,
    'pending'
  ) RETURNING id INTO application_id;
  
  RETURN application_id;
END;
$$;