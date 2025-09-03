-- Fix Critical Security Issues (Corrected)

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

-- Add RLS policies for poll_options table (if it exists and doesn't have policies)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'poll_options' AND table_schema = 'public') THEN
        -- Drop existing policies if they exist to avoid conflicts
        DROP POLICY IF EXISTS "Admins can manage poll options" ON poll_options;
        DROP POLICY IF EXISTS "Users can view poll options" ON poll_options;
        
        -- Create new policies
        CREATE POLICY "Admins can manage poll options" ON poll_options
            FOR ALL USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

        CREATE POLICY "Users can view poll options" ON poll_options
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Add RLS policies for poll_votes table (if it exists and doesn't have policies)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'poll_votes' AND table_schema = 'public') THEN
        -- Drop existing policies if they exist to avoid conflicts
        DROP POLICY IF EXISTS "Admins can manage poll votes" ON poll_votes;
        DROP POLICY IF EXISTS "Users can manage their own poll votes" ON poll_votes;
        
        -- Create new policies
        CREATE POLICY "Admins can manage poll votes" ON poll_votes
            FOR ALL USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

        CREATE POLICY "Users can manage their own poll votes" ON poll_votes
            FOR ALL USING (user_id = auth.uid());
    END IF;
END $$;

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