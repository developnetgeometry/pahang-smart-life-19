-- Create guest permissions table to allow community admins to control guest features
CREATE TABLE public.guest_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(community_id, feature_name)
);

-- Enable RLS
ALTER TABLE public.guest_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for guest permissions
CREATE POLICY "Community admins can manage guest permissions in their community" 
ON public.guest_permissions 
FOR ALL 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) AND 
  community_id = get_user_community()
);

CREATE POLICY "District coordinators can manage guest permissions in their district" 
ON public.guest_permissions 
FOR ALL 
USING (
  has_enhanced_role('district_coordinator'::enhanced_user_role) AND 
  EXISTS(
    SELECT 1 FROM communities c 
    WHERE c.id = guest_permissions.community_id 
    AND c.district_id = get_user_district()
  )
);

CREATE POLICY "State admins can manage all guest permissions" 
ON public.guest_permissions 
FOR ALL 
USING (has_enhanced_role('state_admin'::enhanced_user_role));

-- Create function to get guest permissions for a community
CREATE OR REPLACE FUNCTION public.get_guest_permissions_for_community(p_community_id UUID)
RETURNS TABLE(feature_name TEXT, is_enabled BOOLEAN)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    features.feature_name,
    COALESCE(gp.is_enabled, false) as is_enabled
  FROM (
    VALUES 
      ('marketplace'),
      ('bookings'),
      ('announcements'), 
      ('complaints'),
      ('discussions'),
      ('facilities'),
      ('events'),
      ('directory')
  ) AS features(feature_name)
  LEFT JOIN guest_permissions gp ON gp.community_id = p_community_id AND gp.feature_name = features.feature_name;
$$;

-- Create function to check if guest has permission for a feature
CREATE OR REPLACE FUNCTION public.guest_has_feature_permission(p_user_id UUID, p_feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN NOT has_enhanced_role('guest'::enhanced_user_role, p_user_id) THEN true -- Not a guest, no restrictions
    ELSE COALESCE(
      (
        SELECT gp.is_enabled 
        FROM guest_permissions gp
        JOIN profiles p ON p.community_id = gp.community_id
        WHERE p.id = p_user_id AND gp.feature_name = p_feature_name
      ),
      false -- Default deny for guests if no permission set
    )
  END;
$$;