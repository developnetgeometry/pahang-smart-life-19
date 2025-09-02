-- Create Inventory Management Tables

-- Inventory Items Table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.inventory_categories(id),
  unit_of_measure TEXT NOT NULL DEFAULT 'piece',
  unit_cost NUMERIC(10,2),
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  maximum_stock INTEGER,
  reorder_level INTEGER NOT NULL DEFAULT 0,
  supplier_name TEXT,
  supplier_contact TEXT,
  storage_location TEXT,
  district_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory Transactions Table
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_code TEXT NOT NULL UNIQUE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment', 'transfer')),
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  performed_by UUID NOT NULL,
  reference_type TEXT,
  notes TEXT,
  expiry_date DATE,
  batch_number TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  district_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial Accounts Table
CREATE TABLE public.financial_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('income', 'expense', 'asset', 'liability', 'equity')),
  description TEXT,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  district_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial Transactions Table
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.financial_accounts(id),
  transaction_code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_type TEXT,
  receipt_number TEXT,
  payment_method TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  processed_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  district_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Inventory Items
CREATE POLICY "Users can view inventory items in their district"
ON public.inventory_items FOR SELECT
USING (district_id = get_user_district() OR district_id IS NULL);

CREATE POLICY "Management can manage inventory items"
ON public.inventory_items FOR ALL
USING (
  has_enhanced_role('maintenance_staff'::enhanced_user_role) OR 
  has_enhanced_role('facility_manager'::enhanced_user_role) OR
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- RLS Policies for Inventory Transactions
CREATE POLICY "Users can view inventory transactions in their district"
ON public.inventory_transactions FOR SELECT
USING (district_id = get_user_district() OR district_id IS NULL);

CREATE POLICY "Management can create inventory transactions"
ON public.inventory_transactions FOR INSERT
WITH CHECK (
  performed_by = auth.uid() AND (
    has_enhanced_role('maintenance_staff'::enhanced_user_role) OR 
    has_enhanced_role('facility_manager'::enhanced_user_role) OR
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  )
);

CREATE POLICY "Management can update inventory transactions"
ON public.inventory_transactions FOR UPDATE
USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- RLS Policies for Financial Accounts
CREATE POLICY "Users can view financial accounts in their district"
ON public.financial_accounts FOR SELECT
USING (
  (district_id = get_user_district() OR district_id IS NULL) AND
  (has_enhanced_role('community_admin'::enhanced_user_role) OR 
   has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
   has_enhanced_role('state_admin'::enhanced_user_role))
);

CREATE POLICY "Management can manage financial accounts"
ON public.financial_accounts FOR ALL
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- RLS Policies for Financial Transactions
CREATE POLICY "Users can view financial transactions in their district"
ON public.financial_transactions FOR SELECT
USING (
  (district_id = get_user_district() OR district_id IS NULL) AND
  (has_enhanced_role('community_admin'::enhanced_user_role) OR 
   has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
   has_enhanced_role('state_admin'::enhanced_user_role))
);

CREATE POLICY "Management can create financial transactions"
ON public.financial_transactions FOR INSERT
WITH CHECK (
  processed_by = auth.uid() AND (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  )
);

CREATE POLICY "Management can update financial transactions"
ON public.financial_transactions FOR UPDATE
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category_id);
CREATE INDEX idx_inventory_items_district ON public.inventory_items(district_id);
CREATE INDEX idx_inventory_items_stock_level ON public.inventory_items(current_stock, reorder_level);
CREATE INDEX idx_inventory_transactions_item ON public.inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_date ON public.inventory_transactions(transaction_date);
CREATE INDEX idx_financial_accounts_district ON public.financial_accounts(district_id);
CREATE INDEX idx_financial_transactions_account ON public.financial_transactions(account_id);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_status ON public.financial_transactions(status);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_accounts_updated_at
  BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update inventory stock
CREATE OR REPLACE FUNCTION public.update_inventory_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update stock based on transaction type
  IF NEW.transaction_type = 'stock_in' THEN
    UPDATE public.inventory_items 
    SET current_stock = current_stock + NEW.quantity,
        updated_at = now()
    WHERE id = NEW.item_id;
  ELSIF NEW.transaction_type = 'stock_out' THEN
    UPDATE public.inventory_items 
    SET current_stock = GREATEST(0, current_stock - NEW.quantity),
        updated_at = now()
    WHERE id = NEW.item_id;
  ELSIF NEW.transaction_type = 'adjustment' THEN
    UPDATE public.inventory_items 
    SET current_stock = NEW.quantity,
        updated_at = now()
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update stock on transaction insert
CREATE TRIGGER update_stock_on_transaction
  AFTER INSERT ON public.inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_stock();

-- Create function to automatically update account balance
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update balance when transaction is approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    IF NEW.transaction_type = 'credit' THEN
      UPDATE public.financial_accounts 
      SET balance = balance + NEW.amount,
          updated_at = now()
      WHERE id = NEW.account_id;
    ELSIF NEW.transaction_type = 'debit' THEN
      UPDATE public.financial_accounts 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.account_id;
    END IF;
  ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    -- Reverse the transaction if it was previously approved
    IF NEW.transaction_type = 'credit' THEN
      UPDATE public.financial_accounts 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.account_id;
    ELSIF NEW.transaction_type = 'debit' THEN
      UPDATE public.financial_accounts 
      SET balance = balance + NEW.amount,
          updated_at = now()
      WHERE id = NEW.account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update account balance on transaction status change
CREATE TRIGGER update_account_balance_on_transaction
  AFTER UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance();

-- Insert default financial accounts for communities
INSERT INTO public.financial_accounts (account_code, account_name, account_type, description) VALUES
('INC-001', 'Maintenance Fund', 'income', 'Monthly maintenance fee collections'),
('INC-002', 'Facility Rental Income', 'income', 'Income from community hall and facility rentals'),
('INC-003', 'Event Income', 'income', 'Revenue from community events and activities'),
('EXP-001', 'Equipment Expenses', 'expense', 'Purchases of equipment and tools'),
('EXP-002', 'Utility Expenses', 'expense', 'Electricity, water, and other utility bills'),
('EXP-003', 'Security Expenses', 'expense', 'Security services and equipment'),
('EXP-004', 'Maintenance Expenses', 'expense', 'General maintenance and repair costs'),
('AST-001', 'Cash Account', 'asset', 'Primary cash account for operations'),
('AST-002', 'Bank Account', 'asset', 'Main bank account for community funds');

-- Insert default inventory categories if they don't exist
INSERT INTO public.inventory_categories (name, description, is_active) VALUES
('Cleaning Supplies', 'Cleaning products and materials', true),
('Maintenance Tools', 'Tools and equipment for maintenance', true),
('Safety Equipment', 'Safety gear and emergency supplies', true),
('Office Supplies', 'Administrative and office materials', true),
('Landscaping', 'Gardening and landscaping supplies', true),
('Electrical', 'Electrical components and supplies', true)
ON CONFLICT (name) DO NOTHING;