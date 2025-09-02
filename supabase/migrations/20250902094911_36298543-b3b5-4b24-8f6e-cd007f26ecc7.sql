-- Create service categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business types table
CREATE TABLE IF NOT EXISTS business_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketplace categories table  
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create facility types table
CREATE TABLE IF NOT EXISTS facility_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create asset categories table
CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system configurations table for various app settings
CREATE TABLE IF NOT EXISTS system_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_types ENABLE ROW LEVEL SECURITY;  
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow read access to all authenticated users
CREATE POLICY "Everyone can view service categories" ON service_categories FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "Everyone can view business types" ON business_types FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "Everyone can view marketplace categories" ON marketplace_categories FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "Everyone can view facility types" ON facility_types FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "Everyone can view asset categories" ON asset_categories FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "Everyone can view system configurations" ON system_configurations FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- Management policies for all tables
CREATE POLICY "Admins can manage service categories" ON service_categories FOR ALL USING (has_enhanced_role('community_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role) OR has_enhanced_role('state_admin'::enhanced_user_role));
CREATE POLICY "Admins can manage business types" ON business_types FOR ALL USING (has_enhanced_role('community_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role) OR has_enhanced_role('state_admin'::enhanced_user_role));
CREATE POLICY "Admins can manage marketplace categories" ON marketplace_categories FOR ALL USING (has_enhanced_role('community_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role) OR has_enhanced_role('state_admin'::enhanced_user_role));
CREATE POLICY "Admins can manage facility types" ON facility_types FOR ALL USING (has_enhanced_role('facility_manager'::enhanced_user_role) OR has_enhanced_role('community_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role) OR has_enhanced_role('state_admin'::enhanced_user_role));
CREATE POLICY "Admins can manage asset categories" ON asset_categories FOR ALL USING (has_enhanced_role('community_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role) OR has_enhanced_role('state_admin'::enhanced_user_role));
CREATE POLICY "Admins can manage system configurations" ON system_configurations FOR ALL USING (has_enhanced_role('state_admin'::enhanced_user_role));

-- Insert service categories data
INSERT INTO service_categories (name, description) VALUES
('Home Services', 'Home maintenance and household services'),
('Beauty & Wellness', 'Beauty, health and wellness services'),
('Food & Catering', 'Food delivery and catering services'),
('Transportation', 'Transport and delivery services'),
('Tutoring & Education', 'Educational and tutoring services'),
('Health & Medical', 'Healthcare and medical services'),
('Technology Support', 'IT and technology support services'),
('Business Services', 'Professional business services'),
('Pet Services', 'Pet care and veterinary services'),
('Cleaning Services', 'Professional cleaning services'),
('Maintenance & Repair', 'Maintenance and repair services'),
('Security Services', 'Security and surveillance services'),
('Landscaping', 'Garden and landscape services'),
('Legal Services', 'Legal consultation and services'),
('Financial Services', 'Financial planning and services');

-- Insert business types data
INSERT INTO business_types (name, description) VALUES
('Sole Proprietorship', 'Business owned by a single individual'),
('Partnership', 'Business owned by two or more partners'),
('Private Limited Company (Sdn Bhd)', 'Private limited liability company'),
('Public Limited Company (Bhd)', 'Public limited liability company'),
('Limited Liability Partnership (LLP)', 'Partnership with limited liability');

-- Insert marketplace categories data
INSERT INTO marketplace_categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Furniture', 'Home and office furniture'),
('Books', 'Books and educational materials'),
('Clothing', 'Apparel and accessories'),
('Sports & Recreation', 'Sports equipment and recreational items'),
('Home & Garden', 'Home improvement and gardening items'),
('Vehicles', 'Cars, motorcycles and automotive'),
('Services', 'Professional and personal services');

-- Insert facility types data
INSERT INTO facility_types (name, description) VALUES
('hall', 'Community halls and event spaces'),
('court', 'Sports courts (badminton, tennis, etc.)'),
('room', 'Meeting rooms and conference spaces'),
('pool', 'Swimming pools and aquatic facilities'),
('gym', 'Fitness centers and gymnasiums'),
('other', 'Other specialized facilities');

-- Insert asset categories data
INSERT INTO asset_categories (name, description) VALUES
('furniture', 'Office and community furniture'),
('equipment', 'Tools and equipment'),
('infrastructure', 'Buildings and infrastructure'),
('vehicle', 'Community vehicles'),
('electronics', 'Electronic devices and systems'),
('appliances', 'Household and commercial appliances');