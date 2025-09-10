-- Tighten RLS policies for districts table - only allow SELECT, UPDATE, DELETE for state_admin, no INSERT
DROP POLICY IF EXISTS "Admins can manage districts" ON public.districts;
DROP POLICY IF EXISTS "Everyone can view districts" ON public.districts;

-- New tighter policies
CREATE POLICY "State admins can view all districts" ON public.districts
    FOR SELECT 
    USING (has_enhanced_role('state_admin'::enhanced_user_role));

CREATE POLICY "State admins can update districts" ON public.districts
    FOR UPDATE 
    USING (has_enhanced_role('state_admin'::enhanced_user_role));

CREATE POLICY "State admins can delete districts" ON public.districts
    FOR DELETE 
    USING (has_enhanced_role('state_admin'::enhanced_user_role));

-- No INSERT policy - districts are now read-only except for updates from OSM

-- Delete old demo districts (keep only the 15 Pahang districts)
DELETE FROM districts WHERE name NOT IN (
    'Bentong', 'Bera', 'Cameron Highlands', 'Jerantut', 'Kuantan',
    'Kuala Lipis', 'Maran', 'Pekan', 'Raub', 'Rompin', 'Temerloh',
    'Genting', 'Gebeng', 'Jelai', 'Muadzam Shah'
);