-- Fix remaining security issues that weren't already addressed

-- Drop existing policies if they exist before recreating with better security
DROP POLICY IF EXISTS "Service providers can view their own profiles" ON public.service_provider_profiles;
DROP POLICY IF EXISTS "Authenticated users can view verified service providers" ON public.service_provider_profiles;

-- Create proper RLS policies for service_provider_profiles with correct security
CREATE POLICY "Service providers can manage their own profiles" 
ON public.service_provider_profiles 
FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can view verified service providers in same district" 
ON public.service_provider_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_verified = true AND business_district_id = get_user_district());