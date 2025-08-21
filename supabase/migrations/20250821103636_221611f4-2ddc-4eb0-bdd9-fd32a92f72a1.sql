-- Fix security issues by updating database functions to have proper search_path (Part 2)

-- Update directory_contacts to require authentication (check if not exists)
DO $$
BEGIN
    -- Drop and recreate directory contacts policy
    DROP POLICY IF EXISTS "Users can view directory contacts in their district" ON public.directory_contacts;
    CREATE POLICY "Authenticated users can view directory contacts in their district" 
    ON public.directory_contacts 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL AND ((district_id = get_user_district()) OR (district_id IS NULL)));
    
    -- Drop and recreate emergency contacts policy  
    DROP POLICY IF EXISTS "Everyone can view emergency contacts" ON public.emergency_contacts;
    CREATE POLICY "Authenticated users can view emergency contacts" 
    ON public.emergency_contacts 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);
    
EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error updating policies: %', SQLERRM;
END $$;

-- Ensure service provider profiles table has RLS enabled
ALTER TABLE public.service_provider_profiles ENABLE ROW LEVEL SECURITY;

-- Create missing indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_provider_profiles_user_id 
ON public.service_provider_profiles(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_provider_profiles_verified 
ON public.service_provider_profiles(is_verified) 
WHERE is_verified = true;