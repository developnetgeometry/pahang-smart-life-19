-- Create role request status enum
CREATE TYPE public.role_request_status AS ENUM (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'on_probation',
  'active',
  'expired'
);

-- Create approval requirement types enum
CREATE TYPE public.approval_requirement AS ENUM (
  'community_voting',
  'business_verification',
  'interview_process',
  'background_check',
  'performance_evaluation',
  'multi_level_approval'
);

-- Create role change requests table
CREATE TABLE public.role_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  current_user_role user_role NOT NULL,
  requested_user_role user_role NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'user_initiated', -- 'user_initiated' or 'admin_initiated'
  status role_request_status NOT NULL DEFAULT 'pending',
  reason TEXT NOT NULL,
  justification TEXT,
  attachments TEXT[],
  
  -- Approval workflow
  required_approver_role user_role NOT NULL,
  approval_requirements approval_requirement[],
  assigned_approver_id UUID,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit fields
  approved_by UUID,
  rejection_reason TEXT,
  district_id UUID,
  
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Create role approval steps table for multi-step approvals
CREATE TABLE public.role_approval_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES role_change_requests(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  approver_role user_role NOT NULL,
  approver_id UUID,
  requirement_type approval_requirement NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  comments TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create role audit logs table
CREATE TABLE public.role_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'role_assigned', 'role_removed', 'role_changed', 'request_created', etc.
  old_role user_role,
  new_role user_role,
  performed_by UUID NOT NULL,
  reason TEXT,
  request_id UUID REFERENCES role_change_requests(id),
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  district_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Enable RLS on all tables
ALTER TABLE public.role_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_change_requests
CREATE POLICY "Users can view their own role requests" 
ON public.role_change_requests 
FOR SELECT 
USING (requester_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "Users can create role change requests" 
ON public.role_change_requests 
FOR INSERT 
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Admins can view all role requests in their district" 
ON public.role_change_requests 
FOR SELECT 
USING (
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);

CREATE POLICY "Authorized users can update role requests" 
ON public.role_change_requests 
FOR UPDATE 
USING (
  assigned_approver_id = auth.uid() OR
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);

-- RLS Policies for role_approval_steps
CREATE POLICY "Users can view approval steps for their requests" 
ON public.role_approval_steps 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM role_change_requests r 
    WHERE r.id = request_id 
    AND (r.requester_id = auth.uid() OR r.target_user_id = auth.uid())
  )
);

CREATE POLICY "Approvers can manage their approval steps" 
ON public.role_approval_steps 
FOR ALL 
USING (
  approver_id = auth.uid() OR
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role)
);

-- RLS Policies for role_audit_logs
CREATE POLICY "Admins can view audit logs" 
ON public.role_audit_logs 
FOR SELECT 
USING (
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role)
);

CREATE POLICY "System can insert audit logs" 
ON public.role_audit_logs 
FOR INSERT 
WITH CHECK (performed_by = auth.uid());

-- Create function to get required approver role for role transitions
CREATE OR REPLACE FUNCTION public.get_required_approver_role(
  current_user_role user_role,
  requested_user_role user_role
) RETURNS user_role
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN current_user_role = 'resident' AND requested_user_role IN ('community_leader', 'service_provider', 'facility_manager') THEN 'community_admin'::user_role
    WHEN current_user_role = 'resident' AND requested_user_role = 'security' THEN 'district_coordinator'::user_role
    WHEN current_user_role = 'community_admin' AND requested_user_role = 'district_coordinator' THEN 'state_admin'::user_role
    WHEN current_user_role = 'district_coordinator' AND requested_user_role = 'state_admin' THEN 'admin'::user_role
    ELSE 'admin'::user_role
  END;
$$;

-- Create function to get approval requirements for role transitions
CREATE OR REPLACE FUNCTION public.get_approval_requirements(
  current_user_role user_role,
  requested_user_role user_role
) RETURNS approval_requirement[]
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN current_user_role = 'resident' AND requested_user_role = 'community_leader' THEN ARRAY['community_voting'::approval_requirement]
    WHEN current_user_role = 'resident' AND requested_user_role = 'service_provider' THEN ARRAY['business_verification'::approval_requirement]
    WHEN current_user_role = 'resident' AND requested_user_role = 'facility_manager' THEN ARRAY['interview_process'::approval_requirement]
    WHEN current_user_role = 'resident' AND requested_user_role = 'security' THEN ARRAY['background_check'::approval_requirement]
    WHEN current_user_role = 'community_admin' AND requested_user_role = 'district_coordinator' THEN ARRAY['performance_evaluation'::approval_requirement]
    WHEN current_user_role = 'district_coordinator' AND requested_user_role = 'state_admin' THEN ARRAY['multi_level_approval'::approval_requirement]
    ELSE ARRAY[]::approval_requirement[]
  END;
$$;

-- Create trigger to update timestamps
CREATE TRIGGER update_role_change_requests_updated_at
  BEFORE UPDATE ON public.role_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_role_change_requests_target_user ON role_change_requests(target_user_id);
CREATE INDEX idx_role_change_requests_approver ON role_change_requests(assigned_approver_id);
CREATE INDEX idx_role_change_requests_status ON role_change_requests(status);
CREATE INDEX idx_role_change_requests_district ON role_change_requests(district_id);
CREATE INDEX idx_role_approval_steps_request ON role_approval_steps(request_id);
CREATE INDEX idx_role_audit_logs_user ON role_audit_logs(user_id);
CREATE INDEX idx_role_audit_logs_timestamp ON role_audit_logs(timestamp DESC);