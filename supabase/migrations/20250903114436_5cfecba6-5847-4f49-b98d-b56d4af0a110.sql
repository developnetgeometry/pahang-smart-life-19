-- Add additional configuration data for maintenance staff modules

-- Insert asset condition status types
INSERT INTO public.status_types (code, name, description, color_class, category, sort_order) VALUES
('excellent', 'Excellent', 'Asset in excellent condition', 'bg-green-500', 'asset_condition', 1),
('good', 'Good', 'Asset in good condition', 'bg-blue-500', 'asset_condition', 2),
('fair', 'Fair', 'Asset in fair condition', 'bg-yellow-500', 'asset_condition', 3),
('poor', 'Poor', 'Asset in poor condition', 'bg-orange-500', 'asset_condition', 4),
('needs_replacement', 'Needs Replacement', 'Asset needs immediate replacement', 'bg-red-500', 'asset_condition', 5)
ON CONFLICT (code) DO NOTHING;

-- Create department types table for complaint escalation
CREATE TABLE IF NOT EXISTS public.department_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ms TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert department types
INSERT INTO public.department_types (code, name_en, name_ms, description, icon_name, sort_order) VALUES
('maintenance', 'Maintenance', 'Penyelenggaraan', 'Maintenance and repairs', 'wrench', 1),
('security', 'Security', 'Keselamatan', 'Security and safety issues', 'shield', 2),
('facilities', 'Facilities', 'Kemudahan', 'Facility management', 'building', 3),
('general', 'General/Admin', 'Umum/Pentadbir', 'General administrative matters', 'user', 4),
('noise', 'Noise Control', 'Kawalan Bunyi', 'Noise complaints and control', 'volume-2', 5)
ON CONFLICT (code) DO NOTHING;

-- Create chart colors configuration table
CREATE TABLE IF NOT EXISTS public.chart_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  hex_color TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default chart colors
INSERT INTO public.chart_colors (name, hex_color, category, sort_order) VALUES
('Primary Blue', '#0088FE', 'chart', 1),
('Green', '#00C49F', 'chart', 2),
('Yellow', '#FFBB28', 'chart', 3),
('Orange', '#FF8042', 'chart', 4),
('Purple', '#8884D8', 'chart', 5),
('Teal', '#82CA9D', 'chart', 6)
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.department_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_colors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for department types
CREATE POLICY "Anyone can view active department types" ON public.department_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage department types" ON public.department_types FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role));

-- Create RLS policies for chart colors
CREATE POLICY "Anyone can view active chart colors" ON public.chart_colors FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage chart colors" ON public.chart_colors FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role));