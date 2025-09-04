-- Ensure service providers can operate across all communities/districts
-- Remove district restrictions for service provider operations

-- Create service provider business profiles table for non-resident service providers
CREATE TABLE IF NOT EXISTS public.service_provider_businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_registration_number TEXT,
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  service_areas TEXT[] DEFAULT '{}', -- Array of district/community IDs they serve
  business_type TEXT,
  license_number TEXT,
  license_expiry DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on service provider businesses
ALTER TABLE public.service_provider_businesses ENABLE ROW LEVEL SECURITY;

-- Create policies for service provider businesses
CREATE POLICY "Service providers can manage their business profile"
  ON public.service_provider_businesses
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all business profiles"
  ON public.service_provider_businesses
  FOR SELECT
  USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  );

CREATE POLICY "Public can view verified business info"
  ON public.service_provider_businesses
  FOR SELECT
  USING (is_verified = TRUE);

-- Update marketplace_items to allow service providers to specify service areas
ALTER TABLE public.marketplace_items 
ADD COLUMN IF NOT EXISTS service_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'product';

-- Create function to check if service provider serves an area
CREATE OR REPLACE FUNCTION public.service_provider_serves_area(provider_id UUID, area_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM service_provider_businesses spb
    WHERE spb.user_id = provider_id
    AND (
      area_id = ANY(spb.service_areas) 
      OR array_length(spb.service_areas, 1) IS NULL -- Serves all areas if none specified
    )
  );
$$;

-- Update advertisements table to include service areas
ALTER TABLE public.advertisements 
ADD COLUMN IF NOT EXISTS service_areas TEXT[] DEFAULT '{}';

-- Create improved policies for cross-community service
DROP POLICY IF EXISTS "Service providers can view their own advertisements" ON public.advertisements;
CREATE POLICY "Service providers can manage their advertisements"
  ON public.advertisements
  FOR ALL
  USING (
    advertiser_id = auth.uid() AND 
    has_enhanced_role('service_provider'::enhanced_user_role)
  )
  WITH CHECK (
    advertiser_id = auth.uid() AND 
    has_enhanced_role('service_provider'::enhanced_user_role)
  );

-- Allow residents to view services available in their area
CREATE POLICY "Users can view services in their area"
  ON public.advertisements
  FOR SELECT
  USING (
    is_active = true AND
    (start_date IS NULL OR start_date <= NOW()) AND
    (end_date IS NULL OR end_date > NOW()) AND
    (
      service_areas IS NULL OR 
      array_length(service_areas, 1) IS NULL OR
      get_user_district()::text = ANY(service_areas) OR
      get_user_community()::text = ANY(service_areas)
    )
  );

-- Create service provider onboarding helper function
CREATE OR REPLACE FUNCTION public.setup_service_provider(
  p_business_name TEXT,
  p_service_areas TEXT[] DEFAULT '{}',
  p_business_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  business_id UUID;
BEGIN
  -- Create business profile
  INSERT INTO service_provider_businesses (
    user_id,
    business_name,
    service_areas,
    business_type
  ) VALUES (
    auth.uid(),
    p_business_name,
    p_service_areas,
    p_business_type
  ) RETURNING id INTO business_id;
  
  -- Ensure user has service_provider role
  INSERT INTO enhanced_user_roles (user_id, role, assigned_by, is_active)
  VALUES (auth.uid(), 'service_provider', auth.uid(), true)
  ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;
  
  RETURN business_id;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_service_provider_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_provider_businesses_updated_at
  BEFORE UPDATE ON public.service_provider_businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_provider_businesses_updated_at();