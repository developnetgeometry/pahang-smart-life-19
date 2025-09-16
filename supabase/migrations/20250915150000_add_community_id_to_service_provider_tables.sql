-- Add community_id column to service_provider_applications table
ALTER TABLE public.service_provider_applications 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id);

-- Add community_id column to service_provider_profiles table  
ALTER TABLE public.service_provider_profiles 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_provider_applications_community_id 
ON public.service_provider_applications(community_id);

CREATE INDEX IF NOT EXISTS idx_service_provider_profiles_community_id 
ON public.service_provider_profiles(community_id);

-- Update existing service_provider_applications records to populate community_id 
-- based on the applicant's profile (applicant_id -> profiles.id -> community_id)
UPDATE public.service_provider_applications 
SET community_id = (
    SELECT p.community_id 
    FROM public.profiles p 
    WHERE p.id = service_provider_applications.applicant_id
    LIMIT 1
)
WHERE community_id IS NULL;

-- Update existing service_provider_profiles records to populate community_id 
-- based on user's profile (user_id -> profiles.id -> community_id)
UPDATE public.service_provider_profiles 
SET community_id = (
    SELECT p.community_id 
    FROM public.profiles p 
    WHERE p.id = service_provider_profiles.user_id
    LIMIT 1
)
WHERE community_id IS NULL;
