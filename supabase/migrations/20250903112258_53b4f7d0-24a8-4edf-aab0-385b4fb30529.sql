-- Enhanced Database Structure for Operational Flows (Fixed)

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

-- Insert default escalation rules (with proper casting)
INSERT INTO escalation_rules (module_name, category, priority, from_level, to_level, from_roles, to_roles) VALUES
-- Complaints escalation rules
('complaints', 'maintenance', 'medium', 0, 1, ARRAY['maintenance_staff']::enhanced_user_role[], ARRAY['facility_manager', 'community_admin']::enhanced_user_role[]),
('complaints', 'maintenance', 'high', 0, 1, ARRAY['maintenance_staff']::enhanced_user_role[], ARRAY['facility_manager', 'community_admin']::enhanced_user_role[]),
('complaints', 'maintenance', 'medium', 1, 2, ARRAY['facility_manager', 'community_admin']::enhanced_user_role[], ARRAY['district_coordinator']::enhanced_user_role[]),
('complaints', 'maintenance', 'high', 1, 2, ARRAY['facility_manager', 'community_admin']::enhanced_user_role[], ARRAY['district_coordinator']::enhanced_user_role[]),
('complaints', 'security', 'medium', 0, 1, ARRAY['security_officer']::enhanced_user_role[], ARRAY['community_admin']::enhanced_user_role[]),
('complaints', 'security', 'high', 0, 1, ARRAY['security_officer']::enhanced_user_role[], ARRAY['community_admin', 'district_coordinator']::enhanced_user_role[]),
('complaints', 'security', 'medium', 1, 2, ARRAY['community_admin']::enhanced_user_role[], ARRAY['district_coordinator']::enhanced_user_role[]),
('complaints', 'security', 'high', 1, 2, ARRAY['community_admin']::enhanced_user_role[], ARRAY['district_coordinator', 'state_admin']::enhanced_user_role[]),

-- Work Orders escalation rules  
('work_orders', 'maintenance', 'medium', 0, 1, ARRAY['maintenance_staff']::enhanced_user_role[], ARRAY['facility_manager']::enhanced_user_role[]),
('work_orders', 'maintenance', 'high', 0, 1, ARRAY['maintenance_staff']::enhanced_user_role[], ARRAY['facility_manager', 'community_admin']::enhanced_user_role[]),
('work_orders', 'maintenance', 'medium', 1, 2, ARRAY['facility_manager']::enhanced_user_role[], ARRAY['community_admin']::enhanced_user_role[]),
('work_orders', 'maintenance', 'high', 1, 2, ARRAY['facility_manager', 'community_admin']::enhanced_user_role[], ARRAY['district_coordinator']::enhanced_user_role[]),

-- Emergency escalation rules
('emergency', 'panic_alert', 'urgent', 0, 1, ARRAY['security_officer']::enhanced_user_role[], ARRAY['community_admin', 'district_coordinator']::enhanced_user_role[]),
('emergency', 'security_incident', 'high', 0, 1, ARRAY['security_officer']::enhanced_user_role[], ARRAY['community_admin']::enhanced_user_role[]),
('emergency', 'security_incident', 'high', 1, 2, ARRAY['community_admin']::enhanced_user_role[], ARRAY['district_coordinator']::enhanced_user_role[]);

-- Insert default notification routing rules (with proper casting)
INSERT INTO notification_routing (module_name, event_type, category, priority, target_roles, notification_methods) VALUES
-- Complaints notification routing
('complaints', 'created', 'maintenance', 'medium', ARRAY['maintenance_staff', 'facility_manager']::enhanced_user_role[], ARRAY['in_app']),
('complaints', 'created', 'maintenance', 'high', ARRAY['maintenance_staff', 'facility_manager', 'community_admin']::enhanced_user_role[], ARRAY['in_app']),
('complaints', 'created', 'maintenance', 'urgent', ARRAY['maintenance_staff', 'facility_manager', 'community_admin']::enhanced_user_role[], ARRAY['in_app']),
('complaints', 'created', 'security', 'medium', ARRAY['security_officer', 'community_admin']::enhanced_user_role[], ARRAY['in_app']),
('complaints', 'created', 'security', 'high', ARRAY['security_officer', 'community_admin']::enhanced_user_role[], ARRAY['in_app']),
('complaints', 'created', 'security', 'urgent', ARRAY['security_officer', 'community_admin', 'district_coordinator']::enhanced_user_role[], ARRAY['in_app']),
('complaints', 'escalated', NULL, 'high', ARRAY['community_admin', 'district_coordinator']::enhanced_user_role[], ARRAY['in_app']),
('complaints', 'escalated', NULL, 'urgent', ARRAY['district_coordinator', 'state_admin']::enhanced_user_role[], ARRAY['in_app']),

-- Work Orders notification routing
('work_orders', 'created', 'maintenance', 'medium', ARRAY['maintenance_staff']::enhanced_user_role[], ARRAY['in_app']),
('work_orders', 'created', 'maintenance', 'high', ARRAY['maintenance_staff', 'facility_manager']::enhanced_user_role[], ARRAY['in_app']),
('work_orders', 'assigned', NULL, NULL, ARRAY['maintenance_staff']::enhanced_user_role[], ARRAY['in_app']),
('work_orders', 'status_changed', NULL, NULL, ARRAY['resident']::enhanced_user_role[], ARRAY['in_app']),
('work_orders', 'overdue', NULL, 'medium', ARRAY['facility_manager']::enhanced_user_role[], ARRAY['in_app']),
('work_orders', 'overdue', NULL, 'high', ARRAY['facility_manager', 'community_admin']::enhanced_user_role[], ARRAY['in_app']),

-- Bookings notification routing
('bookings', 'created', NULL, NULL, ARRAY['facility_manager']::enhanced_user_role[], ARRAY['in_app']),
('bookings', 'approved', NULL, NULL, ARRAY['resident']::enhanced_user_role[], ARRAY['in_app']),
('bookings', 'rejected', NULL, NULL, ARRAY['resident']::enhanced_user_role[], ARRAY['in_app']),
('bookings', 'reminder_24h', NULL, NULL, ARRAY['resident']::enhanced_user_role[], ARRAY['in_app']),
('bookings', 'reminder_2h', NULL, NULL, ARRAY['resident']::enhanced_user_role[], ARRAY['in_app']),

-- Emergency notification routing
('emergency', 'panic_alert', NULL, 'urgent', ARRAY['security_officer', 'community_admin', 'district_coordinator']::enhanced_user_role[], ARRAY['in_app']),
('emergency', 'security_incident', NULL, 'high', ARRAY['security_officer', 'community_admin']::enhanced_user_role[], ARRAY['in_app']);