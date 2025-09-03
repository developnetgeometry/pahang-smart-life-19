-- Implement comprehensive workflow system for all modules

-- 1. Service Requests Management
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    location TEXT,
    preferred_date DATE,
    preferred_time TIME,
    budget_range TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    community_id UUID REFERENCES communities(id),
    district_id UUID REFERENCES districts(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT
);

-- 2. Emergency Alerts (Panic Alerts & Security Incidents)
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('panic', 'security', 'fire', 'medical', 'maintenance')),
    severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_alarm')),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    coordinates POINT,
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    responder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    community_id UUID REFERENCES communities(id),
    district_id UUID REFERENCES districts(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    response_notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb
);

-- 3. Visitor Management System
CREATE TABLE IF NOT EXISTS public.visitor_registrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT,
    visitor_ic TEXT,
    visitor_vehicle TEXT,
    visit_purpose TEXT,
    visit_date DATE NOT NULL,
    visit_time_from TIME NOT NULL,
    visit_time_to TIME NOT NULL,
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    host_unit TEXT NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    actual_checkin TIMESTAMP WITH TIME ZONE,
    actual_checkout TIMESTAMP WITH TIME ZONE,
    security_notes TEXT,
    community_id UUID REFERENCES communities(id),
    district_id UUID REFERENCES districts(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Maintenance Schedules for Assets
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    frequency_value INTEGER NOT NULL DEFAULT 1,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    estimated_duration_hours INTEGER,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    next_due_date DATE NOT NULL,
    last_completed DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Marketplace Disputes
CREATE TABLE IF NOT EXISTS public.marketplace_disputes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID, -- Will reference marketplace orders when implemented
    item_id UUID, -- Will reference marketplace items when implemented
    complainant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    respondent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    dispute_type TEXT NOT NULL CHECK (dispute_type IN ('quality', 'delivery', 'payment', 'description', 'other')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    resolution TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    community_id UUID REFERENCES communities(id),
    district_id UUID REFERENCES districts(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Workflow State Management (Universal workflow tracking)
CREATE TABLE IF NOT EXISTS public.workflow_states (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_table TEXT NOT NULL,
    reference_id UUID NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 0,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_role enhanced_user_role,
    status TEXT NOT NULL,
    sla_due_at TIMESTAMP WITH TIME ZONE,
    escalated_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(reference_table, reference_id)
);

-- 7. SLA Configuration
CREATE TABLE IF NOT EXISTS public.sla_configurations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_name TEXT NOT NULL,
    category TEXT,
    priority TEXT NOT NULL,
    level_0_timeout_hours INTEGER NOT NULL DEFAULT 24,
    level_1_timeout_hours INTEGER NOT NULL DEFAULT 48,
    level_2_timeout_hours INTEGER NOT NULL DEFAULT 72,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(module_name, category, priority)
);

-- Enable RLS on all new tables
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Service Requests
CREATE POLICY "Users can view service requests they created or are assigned to" 
ON public.service_requests FOR SELECT 
USING (
    requester_id = auth.uid() OR 
    service_provider_id = auth.uid() OR
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

CREATE POLICY "Users can create service requests" 
ON public.service_requests FOR INSERT 
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Service providers and admins can update service requests" 
ON public.service_requests FOR UPDATE 
USING (
    service_provider_id = auth.uid() OR
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

-- RLS Policies for Emergency Alerts
CREATE POLICY "Anyone can create emergency alerts" 
ON public.emergency_alerts FOR INSERT 
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Security and admins can manage emergency alerts" 
ON public.emergency_alerts FOR ALL 
USING (
    has_enhanced_role('security_officer') OR
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

CREATE POLICY "Users can view emergency alerts in their district" 
ON public.emergency_alerts FOR SELECT 
USING (district_id = get_user_district());

-- RLS Policies for Visitor Registrations
CREATE POLICY "Hosts can manage their visitor registrations" 
ON public.visitor_registrations FOR ALL 
USING (host_id = auth.uid());

CREATE POLICY "Security and admins can manage all visitor registrations" 
ON public.visitor_registrations FOR ALL 
USING (
    has_enhanced_role('security_officer') OR
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

-- RLS Policies for Maintenance Schedules
CREATE POLICY "Facility managers can manage maintenance schedules" 
ON public.maintenance_schedules FOR ALL 
USING (
    has_enhanced_role('facility_manager') OR
    has_enhanced_role('maintenance_staff') OR
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

-- RLS Policies for Marketplace Disputes
CREATE POLICY "Dispute parties can access their disputes" 
ON public.marketplace_disputes FOR SELECT 
USING (
    complainant_id = auth.uid() OR 
    respondent_id = auth.uid() OR
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

CREATE POLICY "Users can create marketplace disputes" 
ON public.marketplace_disputes FOR INSERT 
WITH CHECK (complainant_id = auth.uid());

CREATE POLICY "Admins can manage marketplace disputes" 
ON public.marketplace_disputes FOR UPDATE 
USING (
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

-- RLS Policies for Workflow States
CREATE POLICY "Assigned users and admins can view workflow states" 
ON public.workflow_states FOR SELECT 
USING (
    assigned_to = auth.uid() OR
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

CREATE POLICY "System can manage workflow states" 
ON public.workflow_states FOR ALL 
USING (
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

-- RLS Policies for SLA Configurations
CREATE POLICY "Admins can manage SLA configurations" 
ON public.sla_configurations FOR ALL 
USING (
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

CREATE POLICY "Everyone can view SLA configurations" 
ON public.sla_configurations FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Insert default SLA configurations
INSERT INTO public.sla_configurations (module_name, category, priority, level_0_timeout_hours, level_1_timeout_hours, level_2_timeout_hours) VALUES
('complaints', 'maintenance', 'high', 4, 12, 24),
('complaints', 'maintenance', 'medium', 24, 48, 72),
('complaints', 'maintenance', 'low', 48, 96, 168),
('complaints', 'security', 'high', 1, 4, 12),
('complaints', 'security', 'medium', 12, 24, 48),
('complaints', 'facilities', 'high', 8, 24, 48),
('complaints', 'facilities', 'medium', 24, 48, 96),
('complaints', 'general', 'high', 12, 24, 72),
('complaints', 'general', 'medium', 24, 72, 168),
('work_orders', NULL, 'high', 8, 24, 48),
('work_orders', NULL, 'medium', 24, 48, 96),
('work_orders', NULL, 'low', 48, 96, 168),
('service_requests', NULL, 'high', 4, 12, 24),
('service_requests', NULL, 'medium', 24, 48, 72),
('emergency_alerts', 'panic', 'critical', 0.25, 1, 4),
('emergency_alerts', 'security', 'high', 1, 4, 12),
('emergency_alerts', 'medical', 'critical', 0.25, 1, 2),
('visitor_registrations', NULL, 'medium', 8, 24, 48),
('marketplace_disputes', NULL, 'medium', 48, 96, 168)
ON CONFLICT (module_name, category, priority) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_requests_requester ON service_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_provider ON service_requests(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_type_status ON emergency_alerts(alert_type, status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_district ON emergency_alerts(district_id);
CREATE INDEX IF NOT EXISTS idx_visitor_registrations_host ON visitor_registrations(host_id);
CREATE INDEX IF NOT EXISTS idx_visitor_registrations_date ON visitor_registrations(visit_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_asset ON maintenance_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_due ON maintenance_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_marketplace_disputes_complainant ON marketplace_disputes(complainant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_reference ON workflow_states(reference_table, reference_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_assigned ON workflow_states(assigned_to);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_service_requests_updated_at
    BEFORE UPDATE ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitor_registrations_updated_at
    BEFORE UPDATE ON public.visitor_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_schedules_updated_at
    BEFORE UPDATE ON public.maintenance_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_disputes_updated_at
    BEFORE UPDATE ON public.marketplace_disputes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_states_updated_at
    BEFORE UPDATE ON public.workflow_states
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();