-- Enhanced Database Structure for Operational Flows

-- Add SLA (Service Level Agreement) tracking table
CREATE TABLE IF NOT EXISTS sla_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL, -- 'complaints', 'work_orders', 'bookings', etc.
    category TEXT, -- specific category within module
    priority TEXT NOT NULL, -- 'low', 'medium', 'high', 'urgent'
    level_0_timeout_hours INTEGER DEFAULT 24, -- timeout before escalating to level 1
    level_1_timeout_hours INTEGER DEFAULT 48, -- timeout before escalating to level 2  
    level_2_timeout_hours INTEGER DEFAULT 72, -- timeout before escalating to level 3
    auto_escalation_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(module_name, category, priority)
);

-- Add workflow states tracking
CREATE TABLE IF NOT EXISTS workflow_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_table TEXT NOT NULL, -- 'complaints', 'work_orders', etc.
    reference_id UUID NOT NULL,
    current_level INTEGER DEFAULT 0, -- 0=direct staff, 1=community_admin, 2=district_coordinator, 3=state_admin
    assigned_to UUID REFERENCES auth.users(id),
    assigned_role enhanced_user_role,
    status TEXT NOT NULL,
    escalation_count INTEGER DEFAULT 0,
    last_escalated_at TIMESTAMP WITH TIME ZONE,
    sla_due_at TIMESTAMP WITH TIME ZONE,
    is_overdue BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(reference_table, reference_id)
);

-- Add comprehensive activity log for all modules
CREATE TABLE IF NOT EXISTS module_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL, -- 'complaints', 'work_orders', 'bookings', etc.
    reference_table TEXT NOT NULL,
    reference_id UUID NOT NULL,
    activity_type TEXT NOT NULL, -- 'created', 'assigned', 'status_changed', 'escalated', 'commented', etc.
    description TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    performed_by_role enhanced_user_role,
    previous_state JSONB,
    new_state JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add escalation rules table
CREATE TABLE IF NOT EXISTS escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL,
    category TEXT,
    priority TEXT NOT NULL,
    from_level INTEGER NOT NULL,
    to_level INTEGER NOT NULL,
    from_roles enhanced_user_role[],
    to_roles enhanced_user_role[],
    conditions JSONB DEFAULT '{}', -- additional conditions for escalation
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add notification routing rules
CREATE TABLE IF NOT EXISTS notification_routing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'created', 'assigned', 'escalated', 'overdue', etc.
    category TEXT,
    priority TEXT,
    target_roles enhanced_user_role[],
    notification_methods TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'sms'
    delay_minutes INTEGER DEFAULT 0, -- delay before sending notification
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default SLA configurations
INSERT INTO sla_configurations (module_name, category, priority, level_0_timeout_hours, level_1_timeout_hours, level_2_timeout_hours) VALUES
-- Complaints SLAs
('complaints', 'maintenance', 'low', 48, 96, 168),
('complaints', 'maintenance', 'medium', 24, 48, 96),
('complaints', 'maintenance', 'high', 12, 24, 48),
('complaints', 'maintenance', 'urgent', 2, 6, 12),
('complaints', 'security', 'low', 24, 48, 96),
('complaints', 'security', 'medium', 12, 24, 48),
('complaints', 'security', 'high', 4, 12, 24),
('complaints', 'security', 'urgent', 1, 2, 4),
('complaints', 'facilities', 'low', 48, 96, 168),
('complaints', 'facilities', 'medium', 24, 48, 96),
('complaints', 'facilities', 'high', 12, 24, 48),
('complaints', 'general', 'low', 72, 144, 216),
('complaints', 'general', 'medium', 48, 96, 144),
('complaints', 'general', 'high', 24, 48, 96),

-- Work Orders SLAs
('work_orders', 'maintenance', 'low', 72, 144, 216),
('work_orders', 'maintenance', 'medium', 48, 96, 144),
('work_orders', 'maintenance', 'high', 24, 48, 96),
('work_orders', 'maintenance', 'urgent', 4, 12, 24),
('work_orders', 'preventive', 'low', 168, 336, 504),
('work_orders', 'preventive', 'medium', 96, 192, 288),
('work_orders', 'emergency', 'high', 2, 6, 12),
('work_orders', 'emergency', 'urgent', 1, 2, 4),

-- Bookings SLAs
('bookings', NULL, 'low', 48, 96, 144),
('bookings', NULL, 'medium', 24, 48, 96),
('bookings', NULL, 'high', 12, 24, 48),

-- Emergency Response SLAs
('emergency', 'panic_alert', 'urgent', 0.25, 1, 2), -- 15 minutes, 1 hour, 2 hours
('emergency', 'security_incident', 'high', 1, 4, 8),
('emergency', 'medical', 'urgent', 0.1, 0.5, 1); -- 6 minutes, 30 minutes, 1 hour

-- Insert default escalation rules
INSERT INTO escalation_rules (module_name, category, priority, from_level, to_level, from_roles, to_roles) VALUES
-- Complaints escalation rules
('complaints', 'maintenance', 'medium', 0, 1, ARRAY['maintenance_staff'], ARRAY['facility_manager', 'community_admin']),
('complaints', 'maintenance', 'high', 0, 1, ARRAY['maintenance_staff'], ARRAY['facility_manager', 'community_admin']),
('complaints', 'maintenance', 'medium', 1, 2, ARRAY['facility_manager', 'community_admin'], ARRAY['district_coordinator']),
('complaints', 'maintenance', 'high', 1, 2, ARRAY['facility_manager', 'community_admin'], ARRAY['district_coordinator']),
('complaints', 'security', 'medium', 0, 1, ARRAY['security_officer'], ARRAY['community_admin']),
('complaints', 'security', 'high', 0, 1, ARRAY['security_officer'], ARRAY['community_admin', 'district_coordinator']),
('complaints', 'security', 'medium', 1, 2, ARRAY['community_admin'], ARRAY['district_coordinator']),
('complaints', 'security', 'high', 1, 2, ARRAY['community_admin'], ARRAY['district_coordinator', 'state_admin']),

-- Work Orders escalation rules  
('work_orders', 'maintenance', 'medium', 0, 1, ARRAY['maintenance_staff'], ARRAY['facility_manager']),
('work_orders', 'maintenance', 'high', 0, 1, ARRAY['maintenance_staff'], ARRAY['facility_manager', 'community_admin']),
('work_orders', 'maintenance', 'medium', 1, 2, ARRAY['facility_manager'], ARRAY['community_admin']),
('work_orders', 'maintenance', 'high', 1, 2, ARRAY['facility_manager', 'community_admin'], ARRAY['district_coordinator']),

-- Emergency escalation rules
('emergency', 'panic_alert', 'urgent', 0, 1, ARRAY['security_officer'], ARRAY['community_admin', 'district_coordinator']),
('emergency', 'security_incident', 'high', 0, 1, ARRAY['security_officer'], ARRAY['community_admin']),
('emergency', 'security_incident', 'high', 1, 2, ARRAY['community_admin'], ARRAY['district_coordinator']);

-- Insert default notification routing rules
INSERT INTO notification_routing (module_name, event_type, category, priority, target_roles, notification_methods) VALUES
-- Complaints notification routing
('complaints', 'created', 'maintenance', 'medium', ARRAY['maintenance_staff', 'facility_manager'], ARRAY['in_app']),
('complaints', 'created', 'maintenance', 'high', ARRAY['maintenance_staff', 'facility_manager', 'community_admin'], ARRAY['in_app']),
('complaints', 'created', 'maintenance', 'urgent', ARRAY['maintenance_staff', 'facility_manager', 'community_admin'], ARRAY['in_app']),
('complaints', 'created', 'security', 'medium', ARRAY['security_officer', 'community_admin'], ARRAY['in_app']),
('complaints', 'created', 'security', 'high', ARRAY['security_officer', 'community_admin'], ARRAY['in_app']),
('complaints', 'created', 'security', 'urgent', ARRAY['security_officer', 'community_admin', 'district_coordinator'], ARRAY['in_app']),
('complaints', 'escalated', NULL, 'high', ARRAY['community_admin', 'district_coordinator'], ARRAY['in_app']),
('complaints', 'escalated', NULL, 'urgent', ARRAY['district_coordinator', 'state_admin'], ARRAY['in_app']),

-- Work Orders notification routing
('work_orders', 'created', 'maintenance', 'medium', ARRAY['maintenance_staff'], ARRAY['in_app']),
('work_orders', 'created', 'maintenance', 'high', ARRAY['maintenance_staff', 'facility_manager'], ARRAY['in_app']),
('work_orders', 'assigned', NULL, NULL, ARRAY['maintenance_staff'], ARRAY['in_app']),
('work_orders', 'status_changed', NULL, NULL, ARRAY['resident'], ARRAY['in_app']),
('work_orders', 'overdue', NULL, 'medium', ARRAY['facility_manager'], ARRAY['in_app']),
('work_orders', 'overdue', NULL, 'high', ARRAY['facility_manager', 'community_admin'], ARRAY['in_app']),

-- Bookings notification routing
('bookings', 'created', NULL, NULL, ARRAY['facility_manager'], ARRAY['in_app']),
('bookings', 'approved', NULL, NULL, ARRAY['resident'], ARRAY['in_app']),
('bookings', 'rejected', NULL, NULL, ARRAY['resident'], ARRAY['in_app']),
('bookings', 'reminder_24h', NULL, NULL, ARRAY['resident'], ARRAY['in_app']),
('bookings', 'reminder_2h', NULL, NULL, ARRAY['resident'], ARRAY['in_app']),

-- Emergency notification routing
('emergency', 'panic_alert', NULL, 'urgent', ARRAY['security_officer', 'community_admin', 'district_coordinator'], ARRAY['in_app']),
('emergency', 'security_incident', NULL, 'high', ARRAY['security_officer', 'community_admin'], ARRAY['in_app']);

-- Create function to get SLA timeout for a module/category/priority
CREATE OR REPLACE FUNCTION get_sla_timeout(
    p_module_name TEXT,
    p_category TEXT,
    p_priority TEXT,
    p_level INTEGER DEFAULT 0
) RETURNS INTEGER AS $$
DECLARE
    timeout_hours INTEGER;
BEGIN
    SELECT 
        CASE p_level
            WHEN 0 THEN level_0_timeout_hours
            WHEN 1 THEN level_1_timeout_hours
            WHEN 2 THEN level_2_timeout_hours
            ELSE 72 -- default fallback
        END
    INTO timeout_hours
    FROM sla_configurations
    WHERE module_name = p_module_name
        AND (category = p_category OR category IS NULL)
        AND priority = p_priority
    ORDER BY 
        CASE WHEN category IS NULL THEN 1 ELSE 0 END -- prioritize specific category matches
    LIMIT 1;
    
    RETURN COALESCE(timeout_hours, 24); -- default 24 hours if no SLA found
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enhanced function to handle workflow state creation and updates
CREATE OR REPLACE FUNCTION manage_workflow_state(
    p_reference_table TEXT,
    p_reference_id UUID,
    p_status TEXT,
    p_assigned_to UUID DEFAULT NULL,
    p_assigned_role enhanced_user_role DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT 'medium'
) RETURNS UUID AS $$
DECLARE
    workflow_id UUID;
    timeout_hours INTEGER;
    sla_due TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get SLA timeout
    timeout_hours := get_sla_timeout(p_reference_table, p_category, p_priority, 0);
    sla_due := NOW() + (timeout_hours || ' hours')::INTERVAL;
    
    -- Insert or update workflow state
    INSERT INTO workflow_states (
        reference_table,
        reference_id, 
        current_level,
        assigned_to,
        assigned_role,
        status,
        sla_due_at
    ) VALUES (
        p_reference_table,
        p_reference_id,
        0, -- start at level 0
        p_assigned_to,
        p_assigned_role,
        p_status,
        sla_due
    )
    ON CONFLICT (reference_table, reference_id) 
    DO UPDATE SET
        status = p_status,
        assigned_to = p_assigned_to,
        assigned_role = p_assigned_role,
        updated_at = NOW()
    RETURNING id INTO workflow_id;
    
    RETURN workflow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to escalate overdue workflows
CREATE OR REPLACE FUNCTION escalate_overdue_workflows() RETURNS INTEGER AS $$
DECLARE
    workflow_record RECORD;
    escalation_rule RECORD;
    escalated_count INTEGER := 0;
    new_timeout_hours INTEGER;
    new_sla_due TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Find overdue workflows that can be escalated
    FOR workflow_record IN 
        SELECT ws.*, 
               CASE ws.reference_table 
                   WHEN 'complaints' THEN c.category
                   WHEN 'work_orders' THEN wo.work_order_type::TEXT
                   ELSE NULL
               END as category,
               CASE ws.reference_table
                   WHEN 'complaints' THEN c.priority::TEXT  
                   WHEN 'work_orders' THEN wo.priority::TEXT
                   ELSE 'medium'
               END as priority
        FROM workflow_states ws
        LEFT JOIN complaints c ON ws.reference_table = 'complaints' AND ws.reference_id = c.id
        LEFT JOIN work_orders wo ON ws.reference_table = 'work_orders' AND ws.reference_id = wo.id
        WHERE ws.sla_due_at < NOW() 
            AND ws.status NOT IN ('completed', 'resolved', 'cancelled')
            AND ws.current_level < 3 -- can still escalate
            AND (ws.last_escalated_at IS NULL OR ws.last_escalated_at < NOW() - INTERVAL '1 hour') -- prevent rapid escalation
    LOOP
        -- Find escalation rule
        SELECT * INTO escalation_rule
        FROM escalation_rules er
        WHERE er.module_name = workflow_record.reference_table
            AND (er.category = workflow_record.category OR er.category IS NULL)
            AND er.priority = workflow_record.priority
            AND er.from_level = workflow_record.current_level
            AND er.is_active = true
        ORDER BY 
            CASE WHEN er.category IS NULL THEN 1 ELSE 0 END -- prioritize specific matches
        LIMIT 1;
        
        IF escalation_rule.id IS NOT NULL THEN
            -- Calculate new SLA due date
            new_timeout_hours := get_sla_timeout(
                workflow_record.reference_table, 
                workflow_record.category, 
                workflow_record.priority, 
                escalation_rule.to_level
            );
            new_sla_due := NOW() + (new_timeout_hours || ' hours')::INTERVAL;
            
            -- Update workflow state
            UPDATE workflow_states 
            SET current_level = escalation_rule.to_level,
                escalation_count = escalation_count + 1,
                last_escalated_at = NOW(),
                sla_due_at = new_sla_due,
                is_overdue = false,
                updated_at = NOW()
            WHERE id = workflow_record.id;
            
            -- Log escalation activity
            INSERT INTO module_activities (
                module_name,
                reference_table,
                reference_id,
                activity_type,
                description,
                performed_by_role,
                metadata
            ) VALUES (
                workflow_record.reference_table,
                workflow_record.reference_table,
                workflow_record.reference_id,
                'auto_escalated',
                CONCAT('Automatically escalated from level ', workflow_record.current_level, ' to level ', escalation_rule.to_level, ' due to SLA timeout'),
                'system'::enhanced_user_role,
                jsonb_build_object(
                    'from_level', workflow_record.current_level,
                    'to_level', escalation_rule.to_level,
                    'sla_timeout_hours', new_timeout_hours,
                    'escalation_reason', 'sla_timeout'
                )
            );
            
            escalated_count := escalated_count + 1;
        END IF;
    END LOOP;
    
    -- Mark remaining overdue workflows
    UPDATE workflow_states 
    SET is_overdue = true, updated_at = NOW()
    WHERE sla_due_at < NOW() 
        AND status NOT IN ('completed', 'resolved', 'cancelled')
        AND is_overdue = false;
    
    RETURN escalated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE sla_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;  
ALTER TABLE module_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_routing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Admins can manage SLA configurations" ON sla_configurations
    FOR ALL USING (has_enhanced_role('state_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('community_admin'));

CREATE POLICY "Staff can view SLA configurations" ON sla_configurations  
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can view workflow states" ON workflow_states
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage workflow states" ON workflow_states
    FOR ALL USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

CREATE POLICY "Users can view module activities" ON module_activities
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert module activities" ON module_activities  
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view escalation rules" ON escalation_rules
    FOR SELECT USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

CREATE POLICY "Admins can view notification routing" ON notification_routing
    FOR SELECT USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));