-- Add sample inventory data for Inventory Management
INSERT INTO assets (id, name, description, asset_type, brand, model, serial_number, location, condition_status, purchase_price, current_value, district_id, purchase_date, warranty_expiry, maintenance_schedule, next_maintenance_date, last_maintenance_date, assigned_to, is_active) VALUES 
  (gen_random_uuid(), 'Community Generator', 'Emergency backup generator for common areas', 'equipment', 'Honda', 'EU7000iS', 'HG-2024-001', 'Electrical Room Block A', 'excellent', 15000.00, 14000.00, '00000000-0000-0000-0000-000000000001', '2024-01-15', '2027-01-15', 'Monthly inspection and service', '2025-03-01', '2025-02-01', null, true),
  (gen_random_uuid(), 'Swimming Pool Equipment', 'Pool filtration and chemical dosing system', 'equipment', 'Hayward', 'Pro Series', 'HS-2024-002', 'Pool Equipment Room', 'good', 8500.00, 7200.00, '00000000-0000-0000-0000-000000000001', '2024-02-10', '2026-02-10', 'Weekly maintenance', '2025-03-07', '2025-02-28', null, true),
  (gen_random_uuid(), 'Playground Safety Mats', 'Rubber safety mats for children playground', 'safety_equipment', 'SafeMat', 'Pro-Grip', 'SM-2024-003', 'Children Playground', 'good', 3200.00, 2800.00, '00000000-0000-0000-0000-000000000001', '2024-01-20', '2029-01-20', 'Quarterly inspection', '2025-05-01', '2025-02-01', null, true),
  (gen_random_uuid(), 'CCTV System - Main Gate', 'IP camera system with night vision', 'security_equipment', 'Hikvision', 'DS-2CD2T47G2-L', 'HK-2024-004', 'Main Entrance', 'excellent', 1200.00, 1100.00, '00000000-0000-0000-0000-000000000001', '2024-03-01', '2027-03-01', 'Monthly system check', '2025-03-15', '2025-02-15', null, true),
  (gen_random_uuid(), 'Landscape Equipment Set', 'Lawn mowers and gardening tools', 'maintenance_tools', 'Honda', 'HRX537', 'LM-2024-005', 'Maintenance Storage', 'fair', 2800.00, 2200.00, '00000000-0000-0000-0000-000000000001', '2023-06-15', '2026-06-15', 'Monthly service', '2025-03-10', '2025-02-10', null, true),
  (gen_random_uuid(), 'Fire Safety Equipment', 'Fire extinguishers and safety signage', 'safety_equipment', 'Kidde', 'Pro Series', 'FS-2024-006', 'Multiple Locations', 'excellent', 1500.00, 1400.00, '00000000-0000-0000-0000-000000000001', '2024-01-30', '2029-01-30', 'Annual inspection', '2025-01-30', '2025-01-30', null, true),
  (gen_random_uuid(), 'Elevator Maintenance Kit', 'Tools and parts for elevator servicing', 'maintenance_tools', 'Otis', 'Service Kit Pro', 'EV-2024-007', 'Elevator Machine Room', 'good', 4200.00, 3800.00, '2384b1ce-dbb1-4449-8e78-136d11dbc28e', '2024-02-20', '2027-02-20', 'Bi-annual service', '2025-08-20', '2025-02-20', null, true),
  (gen_random_uuid(), 'Community WiFi Equipment', 'Router and access points for common areas', 'technology', 'Cisco', 'Meraki MX67', 'WF-2024-008', 'IT Room', 'excellent', 3500.00, 3200.00, '0a1c51a3-55dd-46b2-b894-c39c6d75557c', '2024-03-15', '2027-03-15', 'Quarterly update', '2025-06-15', '2025-03-15', null, true);

-- Add sample financial records for Financial Management
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'maintenance_fee', 'utility_payment', 'service_payment')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'online', 'card')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  vendor_supplier TEXT,
  project_code TEXT,
  budget_category TEXT,
  district_id UUID REFERENCES districts(id),
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  receipt_url TEXT,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for financial transactions
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial transactions
CREATE POLICY "Financial managers can view transactions" ON financial_transactions
  FOR SELECT USING (
    has_role('state_admin'::user_role) OR 
    has_role('community_admin'::user_role) OR 
    has_role('district_coordinator'::user_role)
  );

CREATE POLICY "Financial managers can manage transactions" ON financial_transactions
  FOR ALL USING (
    has_role('state_admin'::user_role) OR 
    has_role('community_admin'::user_role) OR 
    has_role('district_coordinator'::user_role)
  );

-- Insert sample financial transaction data
INSERT INTO financial_transactions (transaction_type, amount, description, category, payment_method, transaction_date, reference_number, vendor_supplier, budget_category, district_id, approval_status) VALUES
  ('income', 25000.00, 'Monthly maintenance fees collection - January 2025', 'Maintenance Fees', 'bank_transfer', '2025-01-31', 'MF-202501-001', 'Resident Payments', 'Maintenance', '00000000-0000-0000-0000-000000000001', 'approved'),
  ('expense', 3200.00, 'Landscaping services for community garden', 'Maintenance', 'bank_transfer', '2025-01-15', 'LS-202501-002', 'Green Spaces Sdn Bhd', 'Landscaping', '00000000-0000-0000-0000-000000000001', 'approved'),
  ('expense', 1850.00, 'Swimming pool chemical supplies', 'Utilities', 'cheque', '2025-01-20', 'PC-202501-003', 'AquaChem Malaysia', 'Pool Maintenance', '00000000-0000-0000-0000-000000000001', 'approved'),
  ('utility_payment', 4200.00, 'Electricity bill for common areas', 'Utilities', 'online', '2025-01-25', 'TNB-202501-004', 'Tenaga Nasional Berhad', 'Utilities', '00000000-0000-0000-0000-000000000001', 'approved'),
  ('service_payment', 1500.00, 'Security guard services', 'Security', 'bank_transfer', '2025-01-30', 'SG-202501-005', 'SecureGuard Services', 'Security', '00000000-0000-0000-0000-000000000001', 'approved'),
  ('expense', 650.00, 'Playground equipment repairs', 'Maintenance', 'cash', '2025-02-05', 'PE-202502-006', 'KidSafe Repairs', 'Playground', '00000000-0000-0000-0000-000000000001', 'pending'),
  ('income', 12000.00, 'Community hall rental income', 'Facility Rental', 'bank_transfer', '2025-02-01', 'CH-202502-007', 'Event Organizers', 'Facility Income', '00000000-0000-0000-0000-000000000001', 'approved'),
  ('expense', 2800.00, 'CCTV system maintenance', 'Security', 'bank_transfer', '2025-02-10', 'CC-202502-008', 'TechSecure Solutions', 'Security Equipment', '00000000-0000-0000-0000-000000000001', 'approved'),
  ('maintenance_fee', 18500.00, 'Monthly maintenance fees - February 2025', 'Maintenance Fees', 'bank_transfer', '2025-02-28', 'MF-202502-009', 'Resident Payments', 'Maintenance', '2384b1ce-dbb1-4449-8e78-136d11dbc28e', 'approved'),
  ('expense', 890.00, 'Elevator maintenance service', 'Maintenance', 'cheque', '2025-02-15', 'EV-202502-010', 'Otis Elevator Service', 'Elevator', '2384b1ce-dbb1-4449-8e78-136d11dbc28e', 'approved'),
  ('utility_payment', 2200.00, 'Water bill for February', 'Utilities', 'online', '2025-02-20', 'SAJ-202502-011', 'Syarikat Air Johor', 'Water', '0a1c51a3-55dd-46b2-b894-c39c6d75557c', 'approved'),
  ('expense', 1200.00, 'WiFi router replacement', 'Technology', 'card', '2025-02-18', 'WF-202502-012', 'NetworkPro Solutions', 'IT Equipment', '0a1c51a3-55dd-46b2-b894-c39c6d75557c', 'approved'),
  ('income', 5500.00, 'Parking fee collection Q1 2025', 'Parking Fees', 'bank_transfer', '2025-02-25', 'PK-202502-013', 'Resident Payments', 'Parking', '64a08b8c-820d-40e6-910c-0fc03c45ffe5', 'approved'),
  ('service_payment', 3200.00, 'Waste management services', 'Waste Management', 'bank_transfer', '2025-02-28', 'WM-202502-014', 'EcoClean Services', 'Waste', 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'approved'),
  ('expense', 750.00, 'Fire safety equipment inspection', 'Safety', 'cash', '2025-02-22', 'FS-202502-015', 'SafeCheck Malaysia', 'Safety Equipment', 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'pending');

-- Add inventory items table for better inventory management
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  item_code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  unit_of_measurement TEXT NOT NULL,
  minimum_stock_level INTEGER DEFAULT 10,
  maximum_stock_level INTEGER DEFAULT 100,
  unit_cost DECIMAL(10,2),
  total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity_in_stock * unit_cost) STORED,
  supplier TEXT,
  location TEXT NOT NULL,
  district_id UUID REFERENCES districts(id),
  last_restocked_date DATE,
  next_order_date DATE,
  description TEXT,
  brand TEXT,
  model TEXT,
  barcode TEXT,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for inventory items
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory items
CREATE POLICY "Inventory managers can view items" ON inventory_items
  FOR SELECT USING (
    has_role('maintenance_staff'::user_role) OR
    has_role('facility_manager'::user_role) OR 
    has_role('community_admin'::user_role) OR 
    has_role('district_coordinator'::user_role) OR
    has_role('state_admin'::user_role)
  );

CREATE POLICY "Inventory managers can manage items" ON inventory_items
  FOR ALL USING (
    has_role('maintenance_staff'::user_role) OR
    has_role('facility_manager'::user_role) OR 
    has_role('community_admin'::user_role) OR 
    has_role('district_coordinator'::user_role) OR
    has_role('state_admin'::user_role)
  );

-- Insert sample inventory data
INSERT INTO inventory_items (item_name, item_code, category, subcategory, quantity_in_stock, unit_of_measurement, minimum_stock_level, maximum_stock_level, unit_cost, supplier, location, district_id, last_restocked_date, description, brand, model) VALUES
  ('LED Light Bulbs 12W', 'LED-12W-001', 'Electrical', 'Lighting', 45, 'pieces', 20, 100, 12.50, 'Philips Malaysia', 'Maintenance Storage Block A', '00000000-0000-0000-0000-000000000001', '2025-01-15', 'Energy efficient LED bulbs for common areas', 'Philips', 'Essential LED'),
  ('Pool Chlorine Tablets', 'POOL-CHL-002', 'Pool Supplies', 'Chemicals', 25, 'kg', 15, 50, 35.00, 'AquaChem Malaysia', 'Pool Equipment Room', '00000000-0000-0000-0000-000000000001', '2025-02-01', 'Chlorine tablets for pool sanitization', 'AquaChem', 'Pro Clean'),
  ('Fire Extinguisher 5kg', 'FIRE-EXT-003', 'Safety Equipment', 'Fire Safety', 8, 'pieces', 5, 20, 85.00, 'SafeGuard Equipment', 'Safety Storage Room', '00000000-0000-0000-0000-000000000001', '2025-01-20', 'Dry powder fire extinguishers', 'Kidde', 'Pro Series'),
  ('Cleaning Detergent 5L', 'CLEAN-DET-004', 'Cleaning Supplies', 'Detergents', 32, 'liters', 20, 80, 18.50, 'CleanPro Supplies', 'Cleaning Storage', '00000000-0000-0000-0000-000000000001', '2025-02-10', 'Multi-purpose cleaning detergent', 'CleanPro', 'Industrial'),
  ('Security Camera Cables', 'SEC-CAB-005', 'Security', 'Cables', 150, 'meters', 100, 500, 8.50, 'TechSecure Solutions', 'IT Storage Room', '00000000-0000-0000-0000-000000000001', '2025-01-25', 'Cat6 cables for CCTV installation', 'Belkin', 'Cat6 Pro'),
  ('Elevator Lubricant', 'ELEV-LUB-006', 'Maintenance', 'Lubricants', 6, 'liters', 3, 15, 45.00, 'Otis Service Parts', 'Elevator Machine Room', '2384b1ce-dbb1-4449-8e78-136d11dbc28e', '2025-02-05', 'Special lubricant for elevator mechanisms', 'Otis', 'Premium Grade'),
  ('WiFi Access Points', 'WIFI-AP-007', 'Technology', 'Networking', 4, 'pieces', 2, 10, 280.00, 'NetworkPro Solutions', 'IT Equipment Room', '0a1c51a3-55dd-46b2-b894-c39c6d75557c', '2025-01-30', 'Wireless access points for community areas', 'Cisco', 'Meraki MR33'),
  ('Garden Fertilizer 25kg', 'GARD-FERT-008', 'Landscaping', 'Fertilizers', 12, 'bags', 8, 30, 42.00, 'Green Spaces Supplies', 'Garden Storage Shed', '64a08b8c-820d-40e6-910c-0fc03c45ffe5', '2025-02-15', 'Organic fertilizer for landscaping', 'GrowGreen', 'Organic Plus'),
  ('Waste Bags Heavy Duty', 'WASTE-BAG-009', 'Waste Management', 'Disposal', 200, 'pieces', 100, 500, 2.50, 'EcoClean Supplies', 'Waste Collection Area', 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', '2025-02-20', 'Heavy duty waste collection bags', 'EcoClean', 'Industrial Grade'),
  ('Paint Interior White 5L', 'PAINT-WHT-010', 'Maintenance', 'Paint', 18, 'cans', 10, 40, 65.00, 'ColorCraft Malaysia', 'Paint Storage Room', '00000000-0000-0000-0000-000000000001', '2025-01-10', 'Interior wall paint for touch-ups', 'Dulux', 'Weathershield');

-- Update timestamps trigger for inventory
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();