-- Create inventory_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inventory_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inventory_categories
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_categories
CREATE POLICY "Everyone can view active categories" 
ON public.inventory_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Facility managers and admins can manage categories" 
ON public.inventory_categories 
FOR ALL 
USING (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR 
    has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Create inventory_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    item_code TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES public.inventory_categories(id),
    unit_of_measure TEXT NOT NULL DEFAULT 'piece',
    unit_cost DECIMAL(10,2),
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

-- Enable RLS on inventory_items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_items
CREATE POLICY "Management can view all inventory items" 
ON public.inventory_items 
FOR SELECT 
USING (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR 
    has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
);

CREATE POLICY "Management can manage inventory items" 
ON public.inventory_items 
FOR ALL 
USING (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR 
    has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Create inventory_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id),
    transaction_code TEXT NOT NULL UNIQUE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment', 'transfer')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    performed_by UUID NOT NULL,
    reference_type TEXT,
    notes TEXT,
    expiry_date DATE,
    batch_number TEXT,
    district_id UUID,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inventory_transactions
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_transactions
CREATE POLICY "Management can view all inventory transactions" 
ON public.inventory_transactions 
FOR SELECT 
USING (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR 
    has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
);

CREATE POLICY "Management can create inventory transactions" 
ON public.inventory_transactions 
FOR INSERT 
WITH CHECK (
    (performed_by = auth.uid()) AND
    (has_enhanced_role('facility_manager'::enhanced_user_role) OR 
     has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
     has_enhanced_role('community_admin'::enhanced_user_role) OR 
     has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
     has_enhanced_role('state_admin'::enhanced_user_role))
);

-- Create supporting configuration tables if they don't exist
CREATE TABLE IF NOT EXISTS public.units_of_measure (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on units_of_measure
ALTER TABLE public.units_of_measure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active units of measure" 
ON public.units_of_measure 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage units of measure" 
ON public.units_of_measure 
FOR ALL 
USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Insert default units of measure
INSERT INTO public.units_of_measure (code, name, sort_order) VALUES 
    ('piece', 'Piece', 1),
    ('kg', 'Kilogram', 2),
    ('liter', 'Liter', 3),
    ('meter', 'Meter', 4),
    ('box', 'Box', 5),
    ('roll', 'Roll', 6),
    ('pack', 'Pack', 7),
    ('set', 'Set', 8)
ON CONFLICT (code) DO NOTHING;

-- Create transaction_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transaction_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'inventory',
    color_class TEXT DEFAULT 'bg-blue-500',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transaction_types
ALTER TABLE public.transaction_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active transaction types" 
ON public.transaction_types 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage transaction types" 
ON public.transaction_types 
FOR ALL 
USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Insert default transaction types
INSERT INTO public.transaction_types (code, name, category, color_class, sort_order) VALUES 
    ('stock_in', 'Stock In', 'inventory', 'bg-green-500', 1),
    ('stock_out', 'Stock Out', 'inventory', 'bg-red-500', 2),
    ('adjustment', 'Adjustment', 'inventory', 'bg-yellow-500', 3),
    ('transfer', 'Transfer', 'inventory', 'bg-blue-500', 4)
ON CONFLICT (code) DO NOTHING;

-- Create reference_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reference_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'inventory',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reference_types
ALTER TABLE public.reference_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active reference types" 
ON public.reference_types 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage reference types" 
ON public.reference_types 
FOR ALL 
USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Insert default reference types
INSERT INTO public.reference_types (code, name, category, sort_order) VALUES 
    ('purchase', 'Purchase Order', 'inventory', 1),
    ('maintenance', 'Maintenance Request', 'inventory', 2),
    ('donation', 'Donation', 'inventory', 3),
    ('return', 'Return', 'inventory', 4),
    ('expired', 'Expired Items', 'inventory', 5),
    ('damaged', 'Damaged Items', 'inventory', 6)
ON CONFLICT (code) DO NOTHING;

-- Create trigger to update stock levels automatically
CREATE OR REPLACE FUNCTION public.update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;