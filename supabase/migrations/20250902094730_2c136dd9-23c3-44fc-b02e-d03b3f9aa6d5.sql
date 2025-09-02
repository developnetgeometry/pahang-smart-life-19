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
('Pet Services', 'Pet care and veterinary services');

-- Insert additional service categories for service provider applications
INSERT INTO service_categories (name, description) VALUES
('Cleaning Services', 'Professional cleaning services'),
('Maintenance & Repair', 'Maintenance and repair services'),
('Security Services', 'Security and surveillance services'),
('Landscaping', 'Garden and landscape services'),
('Legal Services', 'Legal consultation and services'),
('Financial Services', 'Financial planning and services')
ON CONFLICT (name) DO NOTHING;

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

-- Insert sample facilities data to replace hardcoded data
INSERT INTO facilities (name, description, location, capacity, hourly_rate, is_available, amenities, operating_hours, district_id, facility_type, images)
SELECT 
  'Community Hall',
  'Main community hall for events and gatherings',
  'Block A, Ground Floor',
  120,
  50.00,
  true,
  ARRAY['Projector', 'Sound System', 'Air Conditioning', 'Tables', 'Chairs'],
  jsonb_build_object('monday', '8:00-22:00', 'tuesday', '8:00-22:00', 'wednesday', '8:00-22:00', 'thursday', '8:00-22:00', 'friday', '8:00-22:00', 'saturday', '8:00-22:00', 'sunday', '8:00-20:00'),
  (SELECT id FROM districts LIMIT 1),
  'hall',
  ARRAY['/src/assets/function-hall.jpg']
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Community Hall');

INSERT INTO facilities (name, description, location, capacity, hourly_rate, is_available, amenities, operating_hours, district_id, facility_type, images)
SELECT 
  'Badminton Court',
  'Professional badminton court with equipment',
  'Sports Complex, Level 1',
  8,
  25.00,
  false,
  ARRAY['Badminton Sets', 'Scoreboard', 'First Aid Kit'],
  jsonb_build_object('monday', '6:00-23:00', 'tuesday', '6:00-23:00', 'wednesday', '6:00-23:00', 'thursday', '6:00-23:00', 'friday', '6:00-23:00', 'saturday', '6:00-23:00', 'sunday', '6:00-23:00'),
  (SELECT id FROM districts LIMIT 1),
  'court',
  ARRAY['/placeholder.svg']
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Badminton Court');

INSERT INTO facilities (name, description, location, capacity, hourly_rate, is_available, amenities, operating_hours, district_id, facility_type, images)
SELECT 
  'Meeting Room B',
  'Small meeting room for discussions and presentations',
  'Block B, Level 2',
  12,
  30.00,
  false,
  ARRAY['Whiteboard', 'Video Conferencing', 'WiFi', 'Air Conditioning'],
  jsonb_build_object('monday', '8:00-18:00', 'tuesday', '8:00-18:00', 'wednesday', '8:00-18:00', 'thursday', '8:00-18:00', 'friday', '8:00-18:00'),
  (SELECT id FROM districts LIMIT 1),
  'room',
  ARRAY['/placeholder.svg']
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Meeting Room B');

INSERT INTO facilities (name, description, location, capacity, hourly_rate, is_available, amenities, operating_hours, district_id, facility_type, images)
SELECT 
  'Swimming Pool',
  'Olympic-size swimming pool with lifeguard services',
  'Recreational Area',
  50,
  20.00,
  true,
  ARRAY['Lifeguard', 'Pool Equipment', 'Changing Rooms', 'Lockers'],
  jsonb_build_object('monday', '6:00-22:00', 'tuesday', '6:00-22:00', 'wednesday', '6:00-22:00', 'thursday', '6:00-22:00', 'friday', '6:00-22:00', 'saturday', '6:00-22:00', 'sunday', '6:00-22:00'),
  (SELECT id FROM districts LIMIT 1),
  'pool',
  ARRAY['/src/assets/swimming-pool.jpg']
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Swimming Pool');

INSERT INTO facilities (name, description, location, capacity, hourly_rate, is_available, amenities, operating_hours, district_id, facility_type, images)
SELECT 
  'Community Gym',
  'Fully equipped fitness center with modern equipment',
  'Health & Fitness Center',
  30,
  15.00,
  true,
  ARRAY['Cardio Equipment', 'Weight Training', 'Personal Trainer Available', 'Air Conditioning', 'Lockers'],
  jsonb_build_object('monday', '5:00-23:00', 'tuesday', '5:00-23:00', 'wednesday', '5:00-23:00', 'thursday', '5:00-23:00', 'friday', '5:00-23:00', 'saturday', '6:00-22:00', 'sunday', '7:00-21:00'),
  (SELECT id FROM districts LIMIT 1),
  'gym',
  ARRAY['/src/assets/community-gym.jpg']
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Community Gym');

-- Insert sample marketplace items to replace hardcoded data
INSERT INTO marketplace_items (seller_id, title, description, price, category, item_condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
  'iPhone 13 Pro Max',
  'Excellent condition, comes with original box and charger',
  3500.00,
  'Electronics',
  'like-new',
  'Block A, Unit 15-2',
  ARRAY['/src/assets/iphone-marketplace.jpg'],
  true,
  (SELECT id FROM districts LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE title = 'iPhone 13 Pro Max');

INSERT INTO marketplace_items (seller_id, title, description, price, category, item_condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
  'IKEA Dining Table Set',
  '6-seater dining table with chairs, good condition',
  800.00,
  'Furniture',
  'good',
  'Block B, Unit 8-1',
  ARRAY['/src/assets/dining-table-marketplace.jpg'],
  true,
  (SELECT id FROM districts LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE title = 'IKEA Dining Table Set');

INSERT INTO marketplace_items (seller_id, title, description, price, category, item_condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
  'Programming Books Collection',
  'Various programming books, perfect for students',
  150.00,
  'Books',
  'good',
  'Block C, Unit 12-5',
  ARRAY['/src/assets/programming-books-marketplace.jpg'],
  true,
  (SELECT id FROM districts LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE title = 'Programming Books Collection');

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_business_types_updated_at BEFORE UPDATE ON business_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_marketplace_categories_updated_at BEFORE UPDATE ON marketplace_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_facility_types_updated_at BEFORE UPDATE ON facility_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON asset_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_system_configurations_updated_at BEFORE UPDATE ON system_configurations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();