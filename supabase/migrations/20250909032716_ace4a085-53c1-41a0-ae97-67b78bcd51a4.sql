-- Create states reference table
CREATE TABLE IF NOT EXISTS public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  country TEXT NOT NULL DEFAULT 'Malaysia',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create countries reference table  
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create district statuses reference table
CREATE TABLE IF NOT EXISTS public.district_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL UNIQUE,
  display_name_en TEXT NOT NULL,
  display_name_ms TEXT NOT NULL,
  color_class TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial data for Malaysian states
INSERT INTO public.states (name, code, country) VALUES
('Johor', 'JHR', 'Malaysia'),
('Kedah', 'KDH', 'Malaysia'),
('Kelantan', 'KTN', 'Malaysia'),
('Kuala Lumpur', 'KUL', 'Malaysia'),
('Labuan', 'LBN', 'Malaysia'),
('Melaka', 'MLK', 'Malaysia'),
('Negeri Sembilan', 'NSN', 'Malaysia'),
('Pahang', 'PHG', 'Malaysia'),
('Penang', 'PNG', 'Malaysia'),
('Perak', 'PRK', 'Malaysia'),
('Perlis', 'PLS', 'Malaysia'),
('Putrajaya', 'PJY', 'Malaysia'),
('Sabah', 'SBH', 'Malaysia'),
('Sarawak', 'SWK', 'Malaysia'),
('Selangor', 'SGR', 'Malaysia'),
('Terengganu', 'TRG', 'Malaysia')
ON CONFLICT (name) DO NOTHING;

-- Insert initial countries
INSERT INTO public.countries (name, code) VALUES
('Malaysia', 'MY'),
('Singapore', 'SG'),
('Indonesia', 'ID'),
('Thailand', 'TH'),
('Brunei', 'BN')
ON CONFLICT (name) DO NOTHING;

-- Insert district statuses
INSERT INTO public.district_statuses (status, display_name_en, display_name_ms, color_class, sort_order) VALUES
('active', 'Active', 'Aktif', 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', 1),
('inactive', 'Inactive', 'Tidak Aktif', 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', 2),
('pending', 'Pending', 'Menunggu', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', 3),
('suspended', 'Suspended', 'Digantung', 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', 4)
ON CONFLICT (status) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.district_statuses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for states
CREATE POLICY "Everyone can view active states" ON public.states
  FOR SELECT USING (is_active = true);

CREATE POLICY "State admins can manage states" ON public.states
  FOR ALL USING (has_enhanced_role('state_admin'));

-- Create RLS policies for countries
CREATE POLICY "Everyone can view active countries" ON public.countries
  FOR SELECT USING (is_active = true);

CREATE POLICY "State admins can manage countries" ON public.countries
  FOR ALL USING (has_enhanced_role('state_admin'));

-- Create RLS policies for district statuses
CREATE POLICY "Everyone can view active district statuses" ON public.district_statuses
  FOR SELECT USING (is_active = true);

CREATE POLICY "State admins can manage district statuses" ON public.district_statuses
  FOR ALL USING (has_enhanced_role('state_admin'));