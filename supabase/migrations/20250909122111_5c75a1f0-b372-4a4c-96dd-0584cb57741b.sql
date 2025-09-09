-- Add community_id to cctv_cameras table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cctv_cameras' AND column_name = 'community_id') THEN
        ALTER TABLE public.cctv_cameras ADD COLUMN community_id uuid;
    END IF;
END $$;

-- Drop existing RLS policies for cctv_cameras
DROP POLICY IF EXISTS "Residents can view cameras in their district" ON public.cctv_cameras;
DROP POLICY IF EXISTS "Security management can manage cameras" ON public.cctv_cameras;

-- Create comprehensive role-based RLS policies for cctv_cameras
CREATE POLICY "Residents can view cameras in their district"
ON public.cctv_cameras
FOR SELECT
TO authenticated
USING (
  has_enhanced_role('resident'::enhanced_user_role) 
  AND district_id = get_user_district()
);

CREATE POLICY "Community leaders can view cameras in their community"
ON public.cctv_cameras
FOR SELECT
TO authenticated
USING (
  has_enhanced_role('community_leader'::enhanced_user_role)
  AND (community_id = get_user_community() OR district_id = get_user_district())
);

CREATE POLICY "Community admins can manage cameras in their community"
ON public.cctv_cameras
FOR ALL
TO authenticated
USING (
  has_enhanced_role('community_admin'::enhanced_user_role)
  AND (community_id = get_user_community() OR district_id = get_user_district())
);

CREATE POLICY "District coordinators can manage all cameras in their district"
ON public.cctv_cameras
FOR ALL
TO authenticated
USING (
  has_enhanced_role('district_coordinator'::enhanced_user_role)
  AND district_id = get_user_district()
);

CREATE POLICY "State admins can manage all cameras"
ON public.cctv_cameras
FOR ALL
TO authenticated
USING (
  has_enhanced_role('state_admin'::enhanced_user_role)
);

CREATE POLICY "Security officers can manage cameras in their district"
ON public.cctv_cameras
FOR ALL
TO authenticated
USING (
  has_enhanced_role('security_officer'::enhanced_user_role)
  AND district_id = get_user_district()
);

-- Enable realtime for cctv_cameras
ALTER TABLE public.cctv_cameras REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cctv_cameras;