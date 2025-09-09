-- Add role-specific columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS family_size integer,
ADD COLUMN IF NOT EXISTS security_license_number text,
ADD COLUMN IF NOT EXISTS badge_id text,
ADD COLUMN IF NOT EXISTS shift_type text,
ADD COLUMN IF NOT EXISTS specialization text,
ADD COLUMN IF NOT EXISTS certifications text[],
ADD COLUMN IF NOT EXISTS years_experience integer;

-- Add RLS policy for high-level admins to update profiles
CREATE POLICY "High level admins can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role_level_or_higher(9));

-- Add RLS policy for high-level admins to insert profiles
CREATE POLICY "High level admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (has_role_level_or_higher(9));