-- Create configuration tables to replace hardcoded data

-- Units of measure table
CREATE TABLE IF NOT EXISTS public.units_of_measure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  abbreviation TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transaction types table
CREATE TABLE IF NOT EXISTS public.transaction_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  color_class TEXT DEFAULT 'bg-gray-500',
  icon_name TEXT,
  category TEXT DEFAULT 'inventory',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reference types table
CREATE TABLE IF NOT EXISTS public.reference_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Priority levels table
CREATE TABLE IF NOT EXISTS public.priority_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  color_class TEXT DEFAULT 'bg-gray-500',
  severity_level INTEGER DEFAULT 1,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Status types table
CREATE TABLE IF NOT EXISTS public.status_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  color_class TEXT DEFAULT 'bg-gray-500',
  category TEXT NOT NULL,
  is_final BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group types table
CREATE TABLE IF NOT EXISTS public.group_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Frequency types table
CREATE TABLE IF NOT EXISTS public.frequency_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  interval_days INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default data for units of measure
INSERT INTO public.units_of_measure (code, name, abbreviation, category, sort_order) VALUES
('piece', 'Piece', 'pcs', 'quantity', 1),
('kg', 'Kilogram', 'kg', 'weight', 2),
('liter', 'Liter', 'L', 'volume', 3),
('meter', 'Meter', 'm', 'length', 4),
('box', 'Box', 'box', 'container', 5),
('roll', 'Roll', 'roll', 'container', 6),
('pack', 'Pack', 'pack', 'container', 7),
('bottle', 'Bottle', 'bottle', 'container', 8),
('set', 'Set', 'set', 'quantity', 9),
('pair', 'Pair', 'pair', 'quantity', 10)
ON CONFLICT (code) DO NOTHING;

-- Insert default data for transaction types
INSERT INTO public.transaction_types (code, name, description, color_class, category, sort_order) VALUES
('stock_in', 'Stock In', 'Adding inventory to stock', 'bg-green-500', 'inventory', 1),
('stock_out', 'Stock Out', 'Removing inventory from stock', 'bg-red-500', 'inventory', 2),
('adjustment', 'Adjustment', 'Stock level adjustment', 'bg-blue-500', 'inventory', 3),
('transfer', 'Transfer', 'Transfer between locations', 'bg-yellow-500', 'inventory', 4)
ON CONFLICT (code) DO NOTHING;

-- Insert default data for reference types
INSERT INTO public.reference_types (code, name, description, category, sort_order) VALUES
('purchase', 'Purchase', 'Purchased from supplier', 'inventory', 1),
('usage', 'Usage', 'Used for operations', 'inventory', 2),
('maintenance', 'Maintenance', 'Used for maintenance work', 'inventory', 3),
('waste', 'Waste', 'Discarded or wasted', 'inventory', 4),
('return', 'Return', 'Returned to supplier', 'inventory', 5),
('donation', 'Donation', 'Donated or given away', 'inventory', 6)
ON CONFLICT (code) DO NOTHING;

-- Insert default data for priority levels
INSERT INTO public.priority_levels (code, name, description, color_class, severity_level, category, sort_order) VALUES
('low', 'Low', 'Low priority item', 'bg-green-500', 1, 'general', 1),
('medium', 'Medium', 'Medium priority item', 'bg-yellow-500', 2, 'general', 2),
('high', 'High', 'High priority item', 'bg-orange-500', 3, 'general', 3),
('urgent', 'Urgent', 'Urgent priority item', 'bg-red-500', 4, 'general', 4)
ON CONFLICT (code) DO NOTHING;

-- Insert default data for status types
INSERT INTO public.status_types (code, name, description, color_class, category, sort_order) VALUES
-- Service request statuses
('pending', 'Pending', 'Awaiting processing', 'bg-gray-500', 'service_request', 1),
('assigned', 'Assigned', 'Assigned to service provider', 'bg-blue-500', 'service_request', 2),
('in_progress', 'In Progress', 'Work in progress', 'bg-orange-500', 'service_request', 3),
('completed', 'Completed', 'Work completed', 'bg-green-500', 'service_request', 4),
('cancelled', 'Cancelled', 'Request cancelled', 'bg-red-500', 'service_request', 5),
-- Financial statuses
('approved', 'Approved', 'Approved for processing', 'bg-green-500', 'financial', 2),
('rejected', 'Rejected', 'Request rejected', 'bg-red-500', 'financial', 3)
ON CONFLICT (code) DO NOTHING;

-- Insert default data for group types
INSERT INTO public.group_types (code, name, description, icon_name, sort_order) VALUES
('interest', 'Interest Group', 'Groups based on common interests', 'heart', 1),
('sports', 'Sports Group', 'Sports and fitness activities', 'activity', 2),
('education', 'Education Group', 'Learning and educational activities', 'book', 3),
('social', 'Social Group', 'Social and community activities', 'users', 4),
('hobby', 'Hobby Group', 'Hobby and recreational activities', 'smile', 5),
('professional', 'Professional Group', 'Professional development and networking', 'briefcase', 6)
ON CONFLICT (code) DO NOTHING;

-- Insert default data for frequency types
INSERT INTO public.frequency_types (code, name, description, interval_days, sort_order) VALUES
('weekly', 'Weekly', 'Once per week', 7, 1),
('biweekly', 'Bi-weekly', 'Every two weeks', 14, 2),
('monthly', 'Monthly', 'Once per month', 30, 3),
('quarterly', 'Quarterly', 'Every three months', 90, 4),
('asNeeded', 'As Needed', 'When required', NULL, 5)
ON CONFLICT (code) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priority_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frequency_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reading configuration data
CREATE POLICY "Anyone can view active configuration data" ON public.units_of_measure FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active transaction types" ON public.transaction_types FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active reference types" ON public.reference_types FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active priority levels" ON public.priority_levels FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active status types" ON public.status_types FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active group types" ON public.group_types FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active frequency types" ON public.frequency_types FOR SELECT USING (is_active = true);

-- Create RLS policies for managing configuration data (admins only)
CREATE POLICY "Admins can manage units of measure" ON public.units_of_measure FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role));
CREATE POLICY "Admins can manage transaction types" ON public.transaction_types FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role));
CREATE POLICY "Admins can manage reference types" ON public.reference_types FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role));
CREATE POLICY "Admins can manage priority levels" ON public.priority_levels FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role));
CREATE POLICY "Admins can manage status types" ON public.status_types FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role));
CREATE POLICY "Admins can manage group types" ON public.group_types FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role));
CREATE POLICY "Admins can manage frequency types" ON public.frequency_types FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role));