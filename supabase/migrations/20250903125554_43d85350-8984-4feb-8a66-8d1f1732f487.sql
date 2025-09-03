-- First, let's check if inventory_items table exists and create it if needed
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

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Management can view all inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Management can manage inventory items" ON public.inventory_items;

-- Create policies that work with the existing user_roles structure
-- Since console shows user has maintenance_staff role, let's use has_role function instead of has_enhanced_role

CREATE POLICY "Staff can view inventory items" 
ON public.inventory_items 
FOR SELECT 
USING (
    has_role('maintenance_staff'::app_role) OR 
    has_role('facility_manager'::app_role) OR
    has_role('community_admin'::app_role) OR 
    has_role('district_coordinator'::app_role) OR 
    has_role('state_admin'::app_role)
);

CREATE POLICY "Staff can insert inventory items" 
ON public.inventory_items 
FOR INSERT 
WITH CHECK (
    has_role('maintenance_staff'::app_role) OR 
    has_role('facility_manager'::app_role) OR
    has_role('community_admin'::app_role) OR 
    has_role('district_coordinator'::app_role) OR 
    has_role('state_admin'::app_role)
);

CREATE POLICY "Staff can update inventory items" 
ON public.inventory_items 
FOR UPDATE 
USING (
    has_role('maintenance_staff'::app_role) OR 
    has_role('facility_manager'::app_role) OR
    has_role('community_admin'::app_role) OR 
    has_role('district_coordinator'::app_role) OR 
    has_role('state_admin'::app_role)
);

CREATE POLICY "Staff can delete inventory items" 
ON public.inventory_items 
FOR DELETE 
USING (
    has_role('maintenance_staff'::app_role) OR 
    has_role('facility_manager'::app_role) OR
    has_role('community_admin'::app_role) OR 
    has_role('district_coordinator'::app_role) OR 
    has_role('state_admin'::app_role)
);