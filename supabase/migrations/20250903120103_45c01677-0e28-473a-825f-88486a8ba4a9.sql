-- Create comprehensive workflow notification system

-- 1. Enhanced notification trigger for Service Requests
CREATE OR REPLACE FUNCTION public.notify_service_request_updates()
RETURNS TRIGGER AS $$
DECLARE
  requester_name TEXT;
  provider_name TEXT;
BEGIN
  -- Get user names
  SELECT COALESCE(full_name, email) INTO requester_name FROM profiles WHERE id = NEW.requester_id;
  
  IF TG_OP = 'INSERT' THEN
    -- Notify relevant service providers
    INSERT INTO notifications (
      recipient_id,
      title,
      message,
      notification_type,
      category,
      reference_id,
      reference_table,
      created_by,
      sent_at,
      priority
    )
    SELECT 
      eur.user_id,
      'New Service Request',
      CONCAT('New ', NEW.service_type, ' request from ', requester_name),
      'service_request',
      NEW.service_type,
      NEW.id,
      'service_requests',
      NEW.requester_id,
      NOW(),
      NEW.priority
    FROM enhanced_user_roles eur
    WHERE eur.role = 'service_provider' AND eur.is_active = true;
    
    RETURN NEW;
  END IF;
  
  -- Notify requester of status updates
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO notifications (
      recipient_id,
      title,
      message,
      notification_type,
      category,
      reference_id,
      reference_table,
      created_by,
      sent_at
    ) VALUES (
      NEW.requester_id,
      'Service Request Updated',
      CONCAT('Your service request status changed to: ', NEW.status),
      'service_request',
      NEW.service_type,
      NEW.id,
      'service_requests',
      NEW.service_provider_id,
      NOW()
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Emergency alerts notification trigger
CREATE OR REPLACE FUNCTION public.notify_emergency_alerts()
RETURNS TRIGGER AS $$
DECLARE
  reporter_name TEXT;
BEGIN
  SELECT COALESCE(full_name, email) INTO reporter_name FROM profiles WHERE id = NEW.reporter_id;
  
  IF TG_OP = 'INSERT' THEN
    -- Immediate notification to security officers
    INSERT INTO notifications (
      recipient_id,
      title,
      message,
      notification_type,
      category,
      reference_id,
      reference_table,
      created_by,
      sent_at,
      priority
    )
    SELECT 
      eur.user_id,
      CONCAT('🚨 ', UPPER(NEW.alert_type), ' ALERT'),
      CONCAT(NEW.title, ' - ', NEW.location),
      'emergency_alert',
      NEW.alert_type,
      NEW.id,
      'emergency_alerts',
      NEW.reporter_id,
      NOW(),
      'high'
    FROM enhanced_user_roles eur
    WHERE eur.role IN ('security_officer', 'community_admin') 
    AND eur.is_active = true;
    
    -- If critical, also notify district coordinator immediately
    IF NEW.severity = 'critical' THEN
      INSERT INTO notifications (
        recipient_id,
        title,
        message,
        notification_type,
        category,
        reference_id,
        reference_table,
        created_by,
        sent_at,
        priority
      )
      SELECT 
        eur.user_id,
        CONCAT('🚨 CRITICAL ALERT: ', NEW.title),
        CONCAT('Critical ', NEW.alert_type, ' alert at ', NEW.location),
        'emergency_alert',
        NEW.alert_type,
        NEW.id,
        'emergency_alerts',
        NEW.reporter_id,
        NOW(),
        'critical'
      FROM enhanced_user_roles eur
      WHERE eur.role = 'district_coordinator' AND eur.is_active = true;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Visitor registration notification trigger
CREATE OR REPLACE FUNCTION public.notify_visitor_registrations()
RETURNS TRIGGER AS $$
DECLARE
  host_name TEXT;
BEGIN
  SELECT COALESCE(full_name, email) INTO host_name FROM profiles WHERE id = NEW.host_id;
  
  IF TG_OP = 'INSERT' THEN
    -- Notify security officers for approval
    INSERT INTO notifications (
      recipient_id,
      title,
      message,
      notification_type,
      category,
      reference_id,
      reference_table,
      created_by,
      sent_at
    )
    SELECT 
      eur.user_id,
      'New Visitor Registration',
      CONCAT('Visitor ', NEW.visitor_name, ' registered by ', host_name, ' for ', NEW.visit_date),
      'visitor_registration',
      'security',
      NEW.id,
      'visitor_registrations',
      NEW.host_id,
      NOW()
    FROM enhanced_user_roles eur
    WHERE eur.role IN ('security_officer', 'community_admin') AND eur.is_active = true;
    
    RETURN NEW;
  END IF;
  
  -- Notify host of approval/rejection
  IF TG_OP = 'UPDATE' AND OLD.approval_status != NEW.approval_status THEN
    INSERT INTO notifications (
      recipient_id,
      title,
      message,
      notification_type,
      category,
      reference_id,
      reference_table,
      created_by,
      sent_at
    ) VALUES (
      NEW.host_id,
      CONCAT('Visitor Registration ', UPPER(NEW.approval_status)),
      CONCAT('Your visitor registration for ', NEW.visitor_name, ' has been ', NEW.approval_status),
      'visitor_registration',
      'security',
      NEW.id,
      'visitor_registrations',
      NEW.approved_by,
      NOW()
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Maintenance schedules notification trigger  
CREATE OR REPLACE FUNCTION public.notify_maintenance_schedules()
RETURNS TRIGGER AS $$
DECLARE
  asset_name TEXT;
BEGIN
  SELECT name INTO asset_name FROM assets WHERE id = NEW.asset_id;
  
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.next_due_date != NEW.next_due_date) THEN
    -- Notify assigned maintenance staff
    IF NEW.assigned_to IS NOT NULL THEN
      INSERT INTO notifications (
        recipient_id,
        title,
        message,
        notification_type,
        category,
        reference_id,
        reference_table,
        created_by,
        sent_at
      ) VALUES (
        NEW.assigned_to,
        'Maintenance Schedule Updated',
        CONCAT('Maintenance for "', asset_name, '" is due on ', NEW.next_due_date),
        'maintenance_schedule',
        'maintenance',
        NEW.id,
        'maintenance_schedules',
        NEW.created_by,
        NOW()
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Create triggers
CREATE TRIGGER notify_service_request_updates_trigger
    AFTER INSERT OR UPDATE ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_service_request_updates();

CREATE TRIGGER notify_emergency_alerts_trigger
    AFTER INSERT ON public.emergency_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_emergency_alerts();

CREATE TRIGGER notify_visitor_registrations_trigger
    AFTER INSERT OR UPDATE ON public.visitor_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_visitor_registrations();

CREATE TRIGGER notify_maintenance_schedules_trigger
    AFTER INSERT OR UPDATE ON public.maintenance_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_maintenance_schedules();

-- 6. Enhanced workflow management function
CREATE OR REPLACE FUNCTION public.escalate_workflow(p_reference_table text, p_reference_id uuid, p_reason text DEFAULT NULL)
RETURNS boolean AS $$
DECLARE
    current_workflow RECORD;
    next_level INTEGER;
    timeout_hours INTEGER;
    new_sla_due TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current workflow state
    SELECT * INTO current_workflow
    FROM workflow_states
    WHERE reference_table = p_reference_table 
    AND reference_id = p_reference_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Calculate next escalation level
    next_level := current_workflow.current_level + 1;
    
    -- Get timeout for next level
    SELECT 
        CASE next_level
            WHEN 1 THEN level_1_timeout_hours
            WHEN 2 THEN level_2_timeout_hours
            ELSE 72
        END
    INTO timeout_hours
    FROM sla_configurations
    WHERE module_name = p_reference_table
    LIMIT 1;
    
    new_sla_due := NOW() + (COALESCE(timeout_hours, 72) || ' hours')::INTERVAL;
    
    -- Update workflow state
    UPDATE workflow_states
    SET 
        current_level = next_level,
        escalated_count = escalated_count + 1,
        sla_due_at = new_sla_due,
        updated_at = NOW()
    WHERE reference_table = p_reference_table 
    AND reference_id = p_reference_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;