-- First, drop existing policies that depend on district_id
DROP POLICY "District coordinators can manage their district features" ON public.district_features;

-- Now we can safely drop the district_id column
ALTER TABLE public.district_features DROP COLUMN district_id;

-- Add community_id column
ALTER TABLE public.district_features ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;

-- Rename the table
ALTER TABLE public.district_features RENAME TO community_features;

-- Update the unique constraint
ALTER TABLE public.community_features DROP CONSTRAINT district_features_district_id_module_name_key;
ALTER TABLE public.community_features ADD CONSTRAINT community_features_community_id_module_name_key UNIQUE(community_id, module_name);

-- Update the remaining policy name and create new policies
DROP POLICY "State admins can manage all district features" ON public.community_features;

CREATE POLICY "State admins can manage all community features"
ON public.community_features
FOR ALL
USING (has_enhanced_role('state_admin'));

CREATE POLICY "District coordinators can manage communities in their district"
ON public.community_features
FOR ALL
USING (
  has_enhanced_role('district_coordinator') AND 
  EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_features.community_id 
    AND c.district_id = get_user_district()
  )
);

CREATE POLICY "Community admins can manage their community features"
ON public.community_features
FOR ALL
USING (
  has_enhanced_role('community_admin') AND 
  community_id = get_user_community()
);