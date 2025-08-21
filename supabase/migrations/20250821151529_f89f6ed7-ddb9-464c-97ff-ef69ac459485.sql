-- Create Asset Management System
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL, -- 'furniture', 'equipment', 'infrastructure', 'vehicle', 'electronics'
  subcategory text,
  brand text,
  model text,
  serial_number text,
  purchase_date date,
  purchase_price numeric(12,2),
  current_value numeric(12,2),
  depreciation_rate numeric(5,2) DEFAULT 0,
  condition_status text DEFAULT 'good' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'needs_replacement')),
  location text NOT NULL,
  assigned_to uuid, -- user responsible for the asset
  district_id uuid,
  warranty_expiry date,
  last_maintenance_date date,
  next_maintenance_date date,
  maintenance_schedule text, -- 'weekly', 'monthly', 'quarterly', 'annual'
  is_active boolean DEFAULT true,
  photos text[],
  documents text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Financial Management System
CREATE TABLE public.financial_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('income', 'expense', 'asset', 'liability', 'equity')),
  account_code text UNIQUE NOT NULL,
  description text,
  parent_account_id uuid REFERENCES public.financial_accounts(id),
  district_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE NOT NULL,
  description text NOT NULL,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(12,2) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  account_id uuid REFERENCES public.financial_accounts(id) NOT NULL,
  reference_type text, -- 'maintenance_fee', 'facility_booking', 'service_payment', 'expense'
  reference_id uuid,
  receipt_number text,
  payment_method text CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'cheque', 'online')),
  processed_by uuid,
  district_id uuid,
  notes text,
  attachments text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Service Request System
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color_code text DEFAULT '#6366f1',
  estimated_response_time interval,
  requires_approval boolean DEFAULT false,
  district_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES public.service_categories(id) NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  requester_id uuid NOT NULL,
  assigned_to uuid,
  location text,
  preferred_date date,
  preferred_time time,
  estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  completion_notes text,
  photos text[],
  attachments text[],
  district_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  assigned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz
);

-- Create Inventory Management System
CREATE TABLE public.inventory_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  parent_category_id uuid REFERENCES public.inventory_categories(id),
  district_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES public.inventory_categories(id) NOT NULL,
  unit_of_measure text DEFAULT 'piece', -- 'piece', 'kg', 'liter', 'meter', etc.
  unit_cost numeric(10,2),
  current_stock integer DEFAULT 0,
  minimum_stock integer DEFAULT 0,
  maximum_stock integer,
  reorder_level integer DEFAULT 0,
  supplier_name text,
  supplier_contact text,
  storage_location text,
  barcode text,
  expiry_tracking boolean DEFAULT false,
  district_id uuid,
  is_active boolean DEFAULT true,
  photos text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text UNIQUE NOT NULL,
  item_id uuid REFERENCES public.inventory_items(id) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment', 'transfer')),
  quantity integer NOT NULL,
  unit_cost numeric(10,2),
  total_cost numeric(10,2),
  reference_type text, -- 'purchase', 'usage', 'maintenance', 'waste'
  reference_id uuid,
  notes text,
  performed_by uuid NOT NULL,
  approved_by uuid,
  transaction_date timestamptz DEFAULT now(),
  expiry_date date,
  batch_number text,
  created_at timestamptz DEFAULT now()
);

-- Create Analytics Tables
CREATE TABLE public.system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric,
  metric_type text NOT NULL, -- 'count', 'percentage', 'amount', 'duration'
  category text NOT NULL, -- 'facility', 'financial', 'service', 'user', 'system'
  subcategory text,
  measurement_date date DEFAULT CURRENT_DATE,
  measurement_time timestamptz DEFAULT now(),
  district_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Assets
CREATE POLICY "Users can view assets in their district" ON public.assets
FOR SELECT USING (district_id = get_user_district());

CREATE POLICY "Management can manage assets" ON public.assets
FOR ALL USING (
  has_role('facility_manager'::user_role) OR 
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

-- RLS Policies for Financial Management
CREATE POLICY "Finance staff can view financial accounts" ON public.financial_accounts
FOR SELECT USING (
  district_id = get_user_district() AND (
    has_role('community_admin'::user_role) OR 
    has_role('district_coordinator'::user_role) OR 
    has_role('state_admin'::user_role)
  )
);

CREATE POLICY "Finance staff can manage financial accounts" ON public.financial_accounts
FOR ALL USING (
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

CREATE POLICY "Users can view relevant financial transactions" ON public.financial_transactions
FOR SELECT USING (
  district_id = get_user_district() AND (
    processed_by = auth.uid() OR
    has_role('community_admin'::user_role) OR 
    has_role('district_coordinator'::user_role) OR 
    has_role('state_admin'::user_role)
  )
);

CREATE POLICY "Finance staff can manage transactions" ON public.financial_transactions
FOR ALL USING (
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

-- RLS Policies for Service Requests
CREATE POLICY "Users can view service categories in their district" ON public.service_categories
FOR SELECT USING (district_id = get_user_district() OR district_id IS NULL);

CREATE POLICY "Management can manage service categories" ON public.service_categories
FOR ALL USING (
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

CREATE POLICY "Users can create service requests" ON public.service_requests
FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can view their own service requests" ON public.service_requests
FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "Assigned staff can view and update their requests" ON public.service_requests
FOR ALL USING (
  assigned_to = auth.uid() OR
  requester_id = auth.uid() OR
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

-- RLS Policies for Inventory
CREATE POLICY "Staff can view inventory in their district" ON public.inventory_categories
FOR SELECT USING (
  district_id = get_user_district() AND (
    has_role('maintenance_staff'::user_role) OR
    has_role('facility_manager'::user_role) OR 
    has_role('community_admin'::user_role) OR 
    has_role('district_coordinator'::user_role) OR 
    has_role('state_admin'::user_role)
  )
);

CREATE POLICY "Management can manage inventory categories" ON public.inventory_categories
FOR ALL USING (
  has_role('facility_manager'::user_role) OR 
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

CREATE POLICY "Staff can view inventory items" ON public.inventory_items
FOR SELECT USING (
  district_id = get_user_district() AND (
    has_role('maintenance_staff'::user_role) OR
    has_role('facility_manager'::user_role) OR 
    has_role('community_admin'::user_role) OR 
    has_role('district_coordinator'::user_role) OR 
    has_role('state_admin'::user_role)
  )
);

CREATE POLICY "Management can manage inventory items" ON public.inventory_items
FOR ALL USING (
  has_role('facility_manager'::user_role) OR 
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

CREATE POLICY "Staff can view inventory transactions" ON public.inventory_transactions
FOR SELECT USING (
  performed_by = auth.uid() OR
  has_role('facility_manager'::user_role) OR 
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

CREATE POLICY "Authorized staff can create inventory transactions" ON public.inventory_transactions
FOR INSERT WITH CHECK (
  performed_by = auth.uid() AND (
    has_role('maintenance_staff'::user_role) OR
    has_role('facility_manager'::user_role) OR 
    has_role('community_admin'::user_role) OR 
    has_role('district_coordinator'::user_role) OR 
    has_role('state_admin'::user_role)
  )
);

-- RLS Policies for System Metrics
CREATE POLICY "Management can view system metrics" ON public.system_metrics
FOR SELECT USING (
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

CREATE POLICY "System can insert metrics" ON public.system_metrics
FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_assets_district_id ON public.assets(district_id);
CREATE INDEX idx_assets_category ON public.assets(category);
CREATE INDEX idx_assets_condition ON public.assets(condition_status);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_account ON public.financial_transactions(account_id);
CREATE INDEX idx_service_requests_status ON public.service_requests(status);
CREATE INDEX idx_service_requests_assigned ON public.service_requests(assigned_to);
CREATE INDEX idx_inventory_items_stock ON public.inventory_items(current_stock, minimum_stock);
CREATE INDEX idx_system_metrics_date ON public.system_metrics(measurement_date, category);

-- Create triggers for updated_at columns
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_accounts_updated_at
  BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for service categories
INSERT INTO public.service_categories (name, description, icon, estimated_response_time) VALUES
('Plumbing', 'Water leaks, pipe repairs, drainage issues', 'Wrench', '2 hours'),
('Electrical', 'Power outages, wiring, lighting repairs', 'Zap', '1 hour'),
('Cleaning', 'General cleaning, deep cleaning services', 'Sparkles', '4 hours'),
('Landscaping', 'Garden maintenance, tree trimming', 'TreePine', '1 day'),
('Security', 'Lock repairs, access card issues', 'Shield', '30 minutes'),
('HVAC', 'Air conditioning, ventilation systems', 'Thermometer', '2 hours'),
('Pest Control', 'Insect and rodent management', 'Bug', '1 day'),
('General Maintenance', 'Minor repairs and maintenance', 'Tool', '4 hours');

-- Insert sample financial accounts
INSERT INTO public.financial_accounts (account_name, account_type, account_code, description) VALUES
('Maintenance Fee Income', 'income', 'INC001', 'Monthly maintenance fees from residents'),
('Facility Rental Income', 'income', 'INC002', 'Income from facility bookings'),
('Utilities Expense', 'expense', 'EXP001', 'Electricity, water, gas expenses'),
('Maintenance Expense', 'expense', 'EXP002', 'General maintenance and repairs'),
('Staff Salary Expense', 'expense', 'EXP003', 'Salaries for maintenance and security staff'),
('Equipment Purchase', 'expense', 'EXP004', 'Purchase of equipment and tools'),
('Insurance Expense', 'expense', 'EXP005', 'Property and liability insurance'),
('Cash at Bank', 'asset', 'ASS001', 'Main bank account balance'),
('Equipment Assets', 'asset', 'ASS002', 'Value of equipment and machinery');

-- Insert sample inventory categories
INSERT INTO public.inventory_categories (name, description) VALUES
('Cleaning Supplies', 'Detergents, disinfectants, cleaning tools'),
('Maintenance Tools', 'Hand tools, power tools, hardware'),
('Plumbing Supplies', 'Pipes, fittings, valves, fixtures'),
('Electrical Supplies', 'Wires, switches, bulbs, fuses'),
('Safety Equipment', 'First aid, fire safety, protective gear'),
('Office Supplies', 'Stationery, documents, printing materials'),
('Landscaping Supplies', 'Seeds, fertilizers, garden tools'),
('HVAC Supplies', 'Filters, refrigerants, ductwork materials');