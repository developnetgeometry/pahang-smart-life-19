-- Fix security issues by updating database functions to have proper search_path

-- Update functions to include SET search_path for security
ALTER FUNCTION public.notify_message_recipients() SET search_path = 'public';
ALTER FUNCTION public.notify_booking_updates() SET search_path = 'public';
ALTER FUNCTION public.notify_complaint_updates() SET search_path = 'public';
ALTER FUNCTION public.notify_announcement_published() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.cleanup_old_typing_indicators() SET search_path = 'public';
ALTER FUNCTION public.create_direct_chat(uuid) SET search_path = 'public';
ALTER FUNCTION public.log_role_change() SET search_path = 'public';
ALTER FUNCTION public.update_user_presence(uuid, text, uuid) SET search_path = 'public';

-- Fix RLS policies for sensitive data exposure
-- Update directory_contacts to require authentication
DROP POLICY IF EXISTS "Users can view directory contacts in their district" ON public.directory_contacts;
CREATE POLICY "Authenticated users can view directory contacts in their district" 
ON public.directory_contacts 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND ((district_id = get_user_district()) OR (district_id IS NULL)));

-- Update emergency_contacts to require authentication for full details
DROP POLICY IF EXISTS "Everyone can view emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Authenticated users can view emergency contacts" 
ON public.emergency_contacts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix service provider profiles access
-- Update service_provider_profiles RLS to be more restrictive
ALTER TABLE public.service_provider_profiles ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for service_provider_profiles if they don't exist
CREATE POLICY "Service providers can view their own profiles" 
ON public.service_provider_profiles 
FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can view verified service providers" 
ON public.service_provider_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_verified = true);

CREATE POLICY "Admins can manage all service provider profiles" 
ON public.service_provider_profiles 
FOR ALL 
USING (has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));