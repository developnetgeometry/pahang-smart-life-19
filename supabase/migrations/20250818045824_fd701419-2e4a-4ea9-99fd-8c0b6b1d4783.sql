-- Create visitor access logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.visitor_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'check_in', 'check_out', 'flagged', 'approved', 'rejected'
  performed_by uuid REFERENCES auth.users(id),
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  location text
);

-- Create visitor blacklist table (if not exists)
CREATE TABLE IF NOT EXISTS public.visitor_blacklist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ic_number text,
  phone_number text,
  reason text NOT NULL,
  added_by uuid REFERENCES auth.users(id),
  district_id uuid REFERENCES public.districts(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Add RLS to existing visitors table if not already enabled
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_blacklist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Residents can manage their own visitors" ON public.visitors;
DROP POLICY IF EXISTS "Security can manage visitors in district" ON public.visitors;
DROP POLICY IF EXISTS "Management can view visitors" ON public.visitors;

-- RLS Policies for visitors table
CREATE POLICY "Residents can manage their own visitors" 
ON public.visitors 
FOR ALL
USING (user_id = auth.uid());

-- Security can view, update visitors in their district  
CREATE POLICY "Security can manage visitors in district"
ON public.visitors
FOR ALL
USING (
  (has_role('security'::user_role) OR has_role('admin'::user_role)) AND 
  district_id = get_user_district()
);

-- Management can view visitors in their scope
CREATE POLICY "Management can view visitors"
ON public.visitors  
FOR SELECT
USING (
  has_role('manager'::user_role) OR 
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);

-- RLS Policies for visitor_logs
CREATE POLICY "Users can view relevant visitor logs"
ON public.visitor_logs
FOR SELECT  
USING (
  -- Host can view logs of their visitors
  EXISTS (
    SELECT 1 FROM public.visitors v 
    WHERE v.id = visitor_logs.visitor_id 
    AND v.user_id = auth.uid()
  ) OR
  -- Security and management can view logs in their district
  (
    has_role('security'::user_role) OR
    has_role('manager'::user_role) OR 
    has_role('admin'::user_role) OR 
    has_role('state_admin'::user_role) OR 
    has_role('district_coordinator'::user_role) OR 
    has_role('community_admin'::user_role)
  )
);

-- Security can create logs
CREATE POLICY "Security can create visitor logs"
ON public.visitor_logs
FOR INSERT
WITH CHECK (
  has_role('security'::user_role) OR
  has_role('admin'::user_role) OR
  has_role('manager'::user_role)
);

-- RLS Policies for visitor_blacklist
CREATE POLICY "Security can manage blacklist"
ON public.visitor_blacklist
FOR ALL
USING (
  has_role('security'::user_role) OR
  has_role('admin'::user_role) OR 
  has_role('manager'::user_role) OR
  has_role('state_admin'::user_role)
);