-- Add missing RLS policies for inventory and system metrics tables

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Staff can view inventory categories in their district" ON public.inventory_categories;
DROP POLICY IF EXISTS "Management can manage inventory categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Staff can view inventory items in their district" ON public.inventory_items;
DROP POLICY IF EXISTS "Management can manage inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Staff can view inventory transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Authorized staff can create inventory transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Management can view system metrics" ON public.system_metrics;
DROP POLICY IF EXISTS "System can insert metrics" ON public.system_metrics;

-- Inventory Categories Policies
CREATE POLICY "Staff can view inventory categories in their district" ON public.inventory_categories
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

-- Inventory Items Policies
CREATE POLICY "Staff can view inventory items in their district" ON public.inventory_items
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

-- Inventory Transactions Policies
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

-- System Metrics Policies
CREATE POLICY "Management can view system metrics" ON public.system_metrics
FOR SELECT USING (
  has_role('community_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('state_admin'::user_role)
);

CREATE POLICY "System can insert metrics" ON public.system_metrics
FOR INSERT WITH CHECK (true);