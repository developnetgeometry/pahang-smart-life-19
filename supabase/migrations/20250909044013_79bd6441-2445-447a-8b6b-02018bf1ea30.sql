-- Add missing columns to districts table
ALTER TABLE public.districts 
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS area NUMERIC,
ADD COLUMN IF NOT EXISTS population INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS communities_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coordinator_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS established_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'::TEXT,
ADD COLUMN IF NOT EXISTS district_type TEXT DEFAULT 'urban'::TEXT;

-- Add check constraints for status and type
ALTER TABLE public.districts 
ADD CONSTRAINT districts_status_check 
CHECK (status IN ('active', 'planning', 'development'));

ALTER TABLE public.districts 
ADD CONSTRAINT districts_type_check 
CHECK (district_type IN ('urban', 'suburban', 'rural'));

-- Update RLS policies for districts
DROP POLICY IF EXISTS "Admins can manage districts" ON public.districts;
DROP POLICY IF EXISTS "Everyone can view districts" ON public.districts;

-- New RLS policies using enhanced roles
CREATE POLICY "State admins can manage all districts" 
ON public.districts 
FOR ALL 
USING (has_enhanced_role('state_admin'::enhanced_user_role));

CREATE POLICY "District coordinators can manage their district" 
ON public.districts 
FOR ALL 
USING (has_enhanced_role('district_coordinator'::enhanced_user_role) AND id = get_user_district());

CREATE POLICY "Everyone can view districts" 
ON public.districts 
FOR SELECT 
USING (true);

-- Create function to get coordinator name
CREATE OR REPLACE FUNCTION public.get_coordinator_name(coordinator_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(full_name, email, 'Unassigned')
  FROM profiles 
  WHERE id = coordinator_id;
$$;