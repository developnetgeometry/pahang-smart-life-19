-- Create visitor management tables
CREATE TABLE public.visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_name text NOT NULL,
  visitor_phone text,
  visitor_ic_number text,
  visitor_vehicle_plate text,
  visitor_photo_url text,
  purpose_of_visit text NOT NULL,
  
  -- Host information
  host_user_id uuid REFERENCES auth.users(id),
  host_unit_number text,
  
  -- Visit details
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_arrival_time time,
  expected_departure_time time,
  actual_arrival_time timestamp with time zone,
  actual_departure_time timestamp with time zone,
  
  -- Status and approval
  status text NOT NULL DEFAULT 'pending',
  qr_code text,
  
  -- Security details
  approved_by uuid REFERENCES auth.users(id),
  checked_in_by uuid REFERENCES auth.users(id),
  checked_out_by uuid REFERENCES auth.users(id),
  
  -- Metadata
  district_id uuid REFERENCES public.districts(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  
  -- Security flags
  is_flagged boolean DEFAULT false,
  flag_reason text,
  flagged_by uuid REFERENCES auth.users(id),
  flagged_at timestamp with time zone
);

-- Add RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Create visitor access logs table
CREATE TABLE public.visitor_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'check_in', 'check_out', 'flagged', 'approved', 'rejected'
  performed_by uuid REFERENCES auth.users(id),
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  location text
);

-- Add RLS
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

-- Create visitor blacklist table
CREATE TABLE public.visitor_blacklist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ic_number text,
  phone_number text,
  reason text NOT NULL,
  added_by uuid REFERENCES auth.users(id),
  district_id uuid REFERENCES public.districts(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Add RLS
ALTER TABLE public.visitor_blacklist ENABLE ROW LEVEL SECURITY;

-- Add update trigger for visitors
CREATE TRIGGER update_visitors_updated_at
BEFORE UPDATE ON public.visitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for visitors table
-- Residents can create and view their own visitor registrations
CREATE POLICY "Residents can manage their own visitors" 
ON public.visitors 
FOR ALL
USING (host_user_id = auth.uid() OR auth.uid() = host_user_id);

-- Security can view, update visitors in their district  
CREATE POLICY "Security can manage visitors in district"
ON public.visitors
FOR ALL
USING (
  has_role('security'::user_role) AND 
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
    AND v.host_user_id = auth.uid()
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