-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Everyone can view active categories" ON public.inventory_categories;
DROP POLICY IF EXISTS "Facility managers and admins can manage categories" ON public.inventory_categories;

-- Create the proper RLS policies for inventory_categories
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

-- Also add a specific INSERT policy to make sure category creation works
CREATE POLICY "Management can insert categories" 
ON public.inventory_categories 
FOR INSERT 
WITH CHECK (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR 
    has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
);