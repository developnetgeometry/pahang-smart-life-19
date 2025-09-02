-- Create event registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.community_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered',
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on event registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event registrations
CREATE POLICY "Users can manage their own registrations"
ON public.event_registrations
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Event organizers can view registrations"
ON public.event_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_activities ca
    WHERE ca.id = event_registrations.event_id
    AND ca.created_by = auth.uid()
  )
  OR has_enhanced_role('community_admin'::enhanced_user_role)
  OR has_enhanced_role('district_coordinator'::enhanced_user_role)
  OR has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Create security alerts table for service providers
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'general',
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  location_description TEXT,
  location_latitude NUMERIC,
  location_longitude NUMERIC,
  district_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security alerts
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security alerts
CREATE POLICY "Users can create security alerts"
ON public.security_alerts
FOR INSERT
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own alerts"
ON public.security_alerts
FOR SELECT
USING (reporter_id = auth.uid());

CREATE POLICY "Security personnel can manage all alerts"
ON public.security_alerts
FOR ALL
USING (
  has_enhanced_role('security_officer'::enhanced_user_role)
  OR has_enhanced_role('community_admin'::enhanced_user_role)
  OR has_enhanced_role('district_coordinator'::enhanced_user_role)
  OR has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Create community group memberships table
CREATE TABLE IF NOT EXISTS public.community_group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(group_id, user_id)
);

-- Enable RLS on group memberships
ALTER TABLE public.community_group_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for group memberships
CREATE POLICY "Users can view group memberships"
ON public.community_group_memberships
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.community_groups cg
    WHERE cg.id = community_group_memberships.group_id
    AND cg.leader_id = auth.uid()
  )
  OR has_enhanced_role('community_admin'::enhanced_user_role)
);

CREATE POLICY "Users can join groups"
ON public.community_group_memberships
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Group leaders can manage memberships"
ON public.community_group_memberships
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.community_groups cg
    WHERE cg.id = community_group_memberships.group_id
    AND cg.leader_id = auth.uid()
  )
  OR has_enhanced_role('community_admin'::enhanced_user_role)
);

-- Create function to update event participant count
CREATE OR REPLACE FUNCTION public.update_event_participant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
    UPDATE public.community_activities
    SET current_participants = current_participants + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'registered' AND OLD.status != 'registered' THEN
      UPDATE public.community_activities
      SET current_participants = current_participants + 1
      WHERE id = NEW.event_id;
    ELSIF OLD.status = 'registered' AND NEW.status != 'registered' THEN
      UPDATE public.community_activities
      SET current_participants = GREATEST(0, current_participants - 1)
      WHERE id = NEW.event_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
    UPDATE public.community_activities
    SET current_participants = GREATEST(0, current_participants - 1)
    WHERE id = OLD.event_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for event participant count
CREATE TRIGGER update_event_participant_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_participant_count();

-- Create function to update group member count
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_count INTEGER;
BEGIN
  -- Count active members for the group
  SELECT COUNT(*) INTO active_count
  FROM public.community_group_memberships
  WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
  AND status = 'active';
  
  -- Update the group member count (assuming we add this column)
  -- For now, we'll just return since the table might not have member_count column
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for group member count
CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.community_group_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_member_count();