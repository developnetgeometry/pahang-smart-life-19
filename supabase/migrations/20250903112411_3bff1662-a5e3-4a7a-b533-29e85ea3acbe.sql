-- Fix Critical Security Issues

-- Enable RLS on tables that don't have it enabled
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Get all tables in public schema that don't have RLS enabled
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE c.relrowsecurity = true
            AND t.schemaname = 'public'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    END LOOP;
END $$;

-- Add missing policies for tables that might not have them
CREATE POLICY IF NOT EXISTS "Admins can manage poll options" ON poll_options
    FOR ALL USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

CREATE POLICY IF NOT EXISTS "Users can view poll options" ON poll_options
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Admins can manage poll votes" ON poll_votes
    FOR ALL USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

CREATE POLICY IF NOT EXISTS "Users can manage their own poll votes" ON poll_votes
    FOR ALL USING (user_id = auth.uid());

-- Fix search path for new functions
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;