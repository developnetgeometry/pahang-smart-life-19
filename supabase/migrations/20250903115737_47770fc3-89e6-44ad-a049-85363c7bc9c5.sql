-- Add RLS policies for the new workflow tables

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