-- Create comprehensive tables for all modules

-- System modules table to manage all available modules
CREATE TABLE IF NOT EXISTS public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Role permissions for modules
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  module_id UUID REFERENCES public.system_modules(id) ON DELETE CASCADE,
  can_read BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, module_id)
);

-- User profiles enhancement
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  district_id UUID REFERENCES public.districts(id),
  unit_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  avatar_url TEXT,
  language_preference TEXT DEFAULT 'en',
  theme_preference TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Service providers table
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  service_category TEXT NOT NULL,
  description TEXT,
  license_number TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  operating_hours JSONB,
  service_areas TEXT[],
  rating NUMERIC(3,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Service appointments
CREATE TABLE IF NOT EXISTS public.service_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community groups enhancement
ALTER TABLE public.community_groups ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'interest';
ALTER TABLE public.community_groups ADD COLUMN IF NOT EXISTS meeting_frequency TEXT;
ALTER TABLE public.community_groups ADD COLUMN IF NOT EXISTS membership_fee NUMERIC(10,2) DEFAULT 0;

-- Group memberships
CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(group_id, user_id)
);

-- Marketplace items
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  condition TEXT DEFAULT 'good',
  images TEXT[],
  location TEXT,
  is_available BOOLEAN DEFAULT true,
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending',
  reference_number TEXT,
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Visitor management enhancement
CREATE TABLE IF NOT EXISTS public.visitor_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
  entry_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  exit_time TIMESTAMP WITH TIME ZONE,
  entry_point TEXT,
  security_officer_id UUID REFERENCES auth.users(id),
  vehicle_plate TEXT,
  purpose_of_visit TEXT,
  approved_by UUID REFERENCES auth.users(id),
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Security patrols
CREATE TABLE IF NOT EXISTS public.security_patrols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patrol_route TEXT NOT NULL,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  checkpoints_completed TEXT[],
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Work orders (maintenance requests enhancement)
ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS work_order_number TEXT;
ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS parts_needed TEXT[];
ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS labor_hours NUMERIC(5,2);

-- Quality inspections
CREATE TABLE IF NOT EXISTS public.quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspector_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL,
  location TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT DEFAULT 'scheduled',
  findings TEXT,
  recommendations TEXT,
  passed BOOLEAN,
  next_inspection_date DATE,
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(15,2) NOT NULL,
  measurement_date DATE NOT NULL,
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  category TEXT,
  is_editable BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_patrols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;