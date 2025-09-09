-- Add missing columns to districts table (skip if already exists)
ALTER TABLE public.districts 
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS area NUMERIC,
ADD COLUMN IF NOT EXISTS population INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS communities_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coordinator_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS established_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'::TEXT,
ADD COLUMN IF NOT EXISTS district_type TEXT DEFAULT 'urban'::TEXT;

-- Add check constraints for status and type (skip if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'districts_status_check') THEN
        ALTER TABLE public.districts 
        ADD CONSTRAINT districts_status_check 
        CHECK (status IN ('active', 'planning', 'development'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'districts_type_check') THEN
        ALTER TABLE public.districts 
        ADD CONSTRAINT districts_type_check 
        CHECK (district_type IN ('urban', 'suburban', 'rural'));
    END IF;
END $$;

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