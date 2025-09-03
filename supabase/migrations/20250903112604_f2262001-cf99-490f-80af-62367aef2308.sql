-- Enhanced Workflow Triggers

-- Enhanced complaint creation trigger with workflow state
CREATE OR REPLACE FUNCTION enhanced_notify_complaint_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_record RECORD;
  complainant_name TEXT;
  workflow_id UUID;
BEGIN
  -- Get complainant name
  SELECT COALESCE(full_name, email, 'Anonymous') INTO complainant_name
  FROM profiles WHERE id = NEW.complainant_id;
  
  -- Create workflow state with proper SLA tracking
  workflow_id := manage_workflow_state(
    'complaints',
    NEW.id,
    NEW.status::TEXT,
    NULL, -- no assignment initially
    NULL, -- no role assignment initially
    NEW.category,
    NEW.priority::TEXT
  );
  
  -- Get notification targets based on routing rules
  FOR recipient_record IN 
    SELECT DISTINCT eur.user_id
    FROM notification_routing nr
    JOIN enhanced_user_roles eur ON eur.role = ANY(nr.target_roles)
    WHERE nr.module_name = 'complaints'
      AND nr.event_type = 'created'
      AND (nr.category = NEW.category OR nr.category IS NULL)
      AND (nr.priority = NEW.priority::TEXT OR nr.priority IS NULL)
      AND eur.is_active = true
    ORDER BY eur.user_id
  LOOP
    -- Insert notification
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
      priority,
      metadata
    ) VALUES (
      recipient_record.user_id,
      CONCAT('New ', NEW.category, ' complaint: ', NEW.title),
      CONCAT(complainant_name, ' submitted a ', NEW.priority, ' priority complaint'),
      'complaint',
      NEW.category,
      NEW.id,
      'complaints',
      NEW.complainant_id,
      NOW(),
      CASE WHEN NEW.priority::TEXT = 'urgent' THEN 'high' ELSE 'normal' END,
      jsonb_build_object(
        'workflow_id', workflow_id,
        'sla_level', 0,
        'category', NEW.category,
        'priority', NEW.priority
      )
    );
  END LOOP;
  
  -- Log creation activity
  INSERT INTO module_activities (
    module_name,
    reference_table,
    reference_id,
    activity_type,
    description,
    performed_by,
    performed_by_role,
    metadata
  ) VALUES (
    'complaints',
    'complaints',
    NEW.id,
    'created',
    CONCAT('New complaint created: ', NEW.title),
    NEW.complainant_id,
    'resident',
    jsonb_build_object(
      'category', NEW.category,
      'priority', NEW.priority,
      'workflow_id', workflow_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Enhanced work order creation trigger
CREATE OR REPLACE FUNCTION enhanced_notify_work_order_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_record RECORD;
  creator_name TEXT;
  workflow_id UUID;
BEGIN
  -- Get creator name
  SELECT COALESCE(full_name, email, 'System') INTO creator_name
  FROM profiles WHERE id = NEW.created_by;
  
  -- Create workflow state
  workflow_id := manage_workflow_state(
    'work_orders',
    NEW.id,
    NEW.status::TEXT,
    NEW.assigned_to,
    'maintenance_staff',
    NEW.work_order_type::TEXT,
    NEW.priority::TEXT
  );
  
  -- Notify based on routing rules
  FOR recipient_record IN 
    SELECT DISTINCT eur.user_id
    FROM notification_routing nr
    JOIN enhanced_user_roles eur ON eur.role = ANY(nr.target_roles)
    WHERE nr.module_name = 'work_orders'
      AND nr.event_type = 'created'
      AND (nr.category = NEW.work_order_type::TEXT OR nr.category IS NULL)
      AND (nr.priority = NEW.priority::TEXT OR nr.priority IS NULL)
      AND eur.is_active = true
      AND (NEW.assigned_to IS NULL OR eur.user_id = NEW.assigned_to)
  LOOP
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
      priority,
      metadata
    ) VALUES (
      recipient_record.user_id,
      CONCAT('New work order: ', NEW.title),
      CONCAT(creator_name, ' created a ', NEW.priority::TEXT, ' priority work order'),
      'work_order',
      NEW.work_order_type::TEXT,
      NEW.id,
      'work_orders',
      NEW.created_by,
      NOW(),
      CASE WHEN NEW.priority::TEXT IN ('high', 'urgent') THEN 'high' ELSE 'normal' END,
      jsonb_build_object(
        'workflow_id', workflow_id,
        'assigned_to', NEW.assigned_to,
        'work_type', NEW.work_order_type
      )
    );
  END LOOP;
  
  -- Log creation activity
  INSERT INTO module_activities (
    module_name,
    reference_table,
    reference_id,
    activity_type,
    description,
    performed_by,
    performed_by_role,
    metadata
  ) VALUES (
    'work_orders',
    'work_orders',
    NEW.id,
    'created',
    CONCAT('Work order created: ', NEW.title),
    NEW.created_by,
    CASE 
      WHEN has_enhanced_role('facility_manager', NEW.created_by) THEN 'facility_manager'
      WHEN has_enhanced_role('community_admin', NEW.created_by) THEN 'community_admin'
      ELSE 'system'
    END,
    jsonb_build_object(
      'work_type', NEW.work_order_type,
      'priority', NEW.priority,
      'assigned_to', NEW.assigned_to,
      'workflow_id', workflow_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Enhanced work order status update trigger
CREATE OR REPLACE FUNCTION enhanced_log_work_order_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update workflow state on status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        UPDATE workflow_states 
        SET status = NEW.status::TEXT,
            updated_at = NOW(),
            -- Mark as completed if work order is completed
            is_overdue = CASE WHEN NEW.status::TEXT IN ('completed', 'resolved') THEN false ELSE is_overdue END
        WHERE reference_table = 'work_orders' 
        AND reference_id = NEW.id;
        
        -- Log status change activity
        INSERT INTO module_activities (
            module_name,
            reference_table,
            reference_id,
            activity_type,
            description,
            performed_by,
            performed_by_role,
            previous_state,
            new_state,
            metadata
        ) VALUES (
            'work_orders',
            'work_orders',
            NEW.id,
            'status_changed',
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status),
            COALESCE(NEW.assigned_to, NEW.created_by),
            CASE 
              WHEN has_enhanced_role('maintenance_staff', COALESCE(NEW.assigned_to, NEW.created_by)) THEN 'maintenance_staff'
              WHEN has_enhanced_role('facility_manager', COALESCE(NEW.assigned_to, NEW.created_by)) THEN 'facility_manager'  
              ELSE 'system'
            END,
            jsonb_build_object('status', OLD.status),
            jsonb_build_object('status', NEW.status),
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'updated_by', COALESCE(NEW.assigned_to, NEW.created_by)
            )
        );
        
        -- Notify complainant if work order is linked to complaint
        IF NEW.complaint_id IS NOT NULL THEN
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
                c.complainant_id,
                CONCAT('Work Order Update: ', NEW.title),
                CONCAT('Work order status updated to: ', NEW.status::TEXT),
                'work_order',
                NEW.work_order_type::TEXT,
                NEW.id,
                'work_orders',
                COALESCE(NEW.assigned_to, NEW.created_by),
                NOW()
            FROM complaints c
            WHERE c.id = NEW.complaint_id;
        END IF;
    END IF;
    
    -- Handle assignment changes
    IF TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
        UPDATE workflow_states 
        SET assigned_to = NEW.assigned_to,
            assigned_role = 'maintenance_staff',
            updated_at = NOW()
        WHERE reference_table = 'work_orders' 
        AND reference_id = NEW.id;
        
        -- Log assignment activity
        INSERT INTO module_activities (
            module_name,
            reference_table,
            reference_id,
            activity_type,
            description,
            performed_by,
            performed_by_role,
            metadata
        ) VALUES (
            'work_orders',
            'work_orders', 
            NEW.id,
            'assigned',
            CASE 
              WHEN NEW.assigned_to IS NOT NULL THEN CONCAT('Work order assigned to maintenance staff')
              ELSE 'Work order assignment removed'
            END,
            COALESCE(NEW.assigned_to, NEW.created_by),
            'facility_manager',
            jsonb_build_object(
                'assigned_to', NEW.assigned_to,
                'previous_assignee', OLD.assigned_to
            )
        );
        
        -- Notify new assignee
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
                sent_at,
                priority
            ) VALUES (
                NEW.assigned_to,
                CONCAT('New Work Order Assigned: ', NEW.title),
                CONCAT('You have been assigned a ', NEW.priority::TEXT, ' priority work order'),
                'work_order',
                NEW.work_order_type::TEXT,
                NEW.id,
                'work_orders',
                NEW.created_by,
                NOW(),
                CASE WHEN NEW.priority::TEXT IN ('high', 'urgent') THEN 'high' ELSE 'normal' END
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop old triggers and create new ones
DROP TRIGGER IF EXISTS log_work_order_activity ON work_orders;
CREATE TRIGGER enhanced_log_work_order_activity
    AFTER INSERT OR UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION enhanced_log_work_order_activity();

-- Create new complaint trigger
DROP TRIGGER IF EXISTS notify_complaint_updates ON complaints;
CREATE TRIGGER enhanced_notify_complaint_creation
    AFTER INSERT ON complaints
    FOR EACH ROW EXECUTE FUNCTION enhanced_notify_complaint_creation();

DROP TRIGGER IF EXISTS notify_work_order_creation ON work_orders;
CREATE TRIGGER enhanced_notify_work_order_creation
    AFTER INSERT ON work_orders
    FOR EACH ROW EXECUTE FUNCTION enhanced_notify_work_order_creation();

-- Create function to be called by cron job for auto-escalation
CREATE OR REPLACE FUNCTION process_workflow_escalations() 
RETURNS TEXT AS $$
DECLARE
  escalated_count INTEGER;
  result_message TEXT;
BEGIN
  -- Process escalations
  SELECT escalate_overdue_workflows() INTO escalated_count;
  
  result_message := CONCAT('Processed ', escalated_count, ' workflow escalations');
  
  -- Log the escalation batch
  INSERT INTO module_activities (
    module_name,
    reference_table, 
    reference_id,
    activity_type,
    description,
    performed_by_role,
    metadata
  ) VALUES (
    'system',
    'system',
    gen_random_uuid(),
    'batch_escalation',
    result_message,
    'system',
    jsonb_build_object(
      'escalated_count', escalated_count,
      'processed_at', NOW()
    )
  );
  
  RETURN result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;