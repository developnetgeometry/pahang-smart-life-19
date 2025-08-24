-- Update profiles table to match the profile page fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_no TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_no_type TEXT DEFAULT 'ic';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile_no TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS socio_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS race_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ethnic_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS oku_status BOOLEAN DEFAULT FALSE;

-- Employment and education fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS type_sector TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS income_range TEXT;

-- Status and membership fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_status BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_membership TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_entrepreneur BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS register_method TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_status BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS supervision TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_id TEXT;

-- Declaration fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pdpa_declare BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agree_declare BOOLEAN DEFAULT FALSE;

-- Audit fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to auto-calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age_from_dob()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dob IS NOT NULL THEN
    NEW.age := DATE_PART('year', AGE(NEW.dob));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update age when dob changes
DROP TRIGGER IF EXISTS update_age_on_dob_change ON public.profiles;
CREATE TRIGGER update_age_on_dob_change
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_age_from_dob();

-- Create trigger to update updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint on identity_no to prevent duplicates
ALTER TABLE public.profiles ADD CONSTRAINT unique_identity_no UNIQUE (identity_no);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_identity_no ON public.profiles (identity_no);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles (gender);
CREATE INDEX IF NOT EXISTS idx_profiles_race_id ON public.profiles (race_id);
CREATE INDEX IF NOT EXISTS idx_profiles_nationality_id ON public.profiles (nationality_id);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_id ON public.profiles (membership_id);