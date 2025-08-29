-- Fix security warnings: Set search_path for functions to prevent SQL injection

-- Fix get_complaint_recipients function
CREATE OR REPLACE FUNCTION get_complaint_recipients(
  p_category TEXT,
  p_district_id UUID,
  p_escalation_level INTEGER DEFAULT 0
) RETURNS TABLE (
  user_id UUID,
  role enhanced_user_role,
  priority_order INTEGER
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH role_mapping AS (
    SELECT UNNEST(CASE p_category
      WHEN 'maintenance' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['maintenance_staff', 'facility_manager']
          WHEN 1 THEN ARRAY['facility_manager', 'community_admin']
          ELSE ARRAY['community_admin', 'district_coordinator', 'state_admin']
        END
      WHEN 'security' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['security_officer', 'community_admin']
          WHEN 1 THEN ARRAY['community_admin', 'district_coordinator']
          ELSE ARRAY['district_coordinator', 'state_admin']
        END
      WHEN 'facilities' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['facility_manager', 'community_admin']
          WHEN 1 THEN ARRAY['community_admin', 'district_coordinator']
          ELSE ARRAY['district_coordinator', 'state_admin']
        END
      WHEN 'noise' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['community_admin']
          WHEN 1 THEN ARRAY['community_admin', 'district_coordinator']
          ELSE ARRAY['district_coordinator', 'state_admin']
        END
      ELSE -- general and others
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['community_admin']
          WHEN 1 THEN ARRAY['community_admin', 'district_coordinator']
          ELSE ARRAY['district_coordinator', 'state_admin']
        END
    END::enhanced_user_role) AS target_role,
    generate_series(1, array_length(CASE p_category
      WHEN 'maintenance' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['maintenance_staff', 'facility_manager']
          WHEN 1 THEN ARRAY['facility_manager', 'community_admin']
          ELSE ARRAY['community_admin', 'district_coordinator', 'state_admin']
        END
      WHEN 'security' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['security_officer', 'community_admin']
          WHEN 1 THEN ARRAY['community_admin', 'district_coordinator']
          ELSE ARRAY['district_coordinator', 'state_admin']
        END
      WHEN 'facilities' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['facility_manager', 'community_admin']
          WHEN 1 THEN ARRAY['community_admin', 'district_coordinator']
          ELSE ARRAY['district_coordinator', 'state_admin']
        END
      WHEN 'noise' THEN 
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['community_admin']
          WHEN 1 THEN ARRAY['community_admin', 'district_coordinator']
          ELSE ARRAY['district_coordinator', 'state_admin']
        END
      ELSE -- general and others
        CASE p_escalation_level
          WHEN 0 THEN ARRAY['community_admin']
          WHEN 1 THEN ARRAY['community_admin', 'district_coordinator']
          ELSE ARRAY['district_coordinator', 'state_admin']
        END
    END::enhanced_user_role, 1)) AS priority_order
  )
  SELECT 
    eur.user_id,
    rm.target_role,
    rm.priority_order
  FROM role_mapping rm
  JOIN enhanced_user_roles eur ON eur.role = rm.target_role
  JOIN profiles p ON p.id = eur.user_id
  WHERE eur.is_active = true
    AND (p.district_id = p_district_id OR rm.target_role IN ('state_admin'))
  ORDER BY rm.priority_order, eur.created_at;
END;
$$;

-- Fix notify_complaint_updates function
CREATE OR REPLACE FUNCTION notify_complaint_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_record RECORD;
  notification_type TEXT;
  complaint_title TEXT;
  complainant_name TEXT;
BEGIN
  -- Get complainant name
  SELECT COALESCE(full_name, email, 'Anonymous') INTO complainant_name
  FROM profiles WHERE id = COALESCE(NEW.complainant_id, OLD.complainant_id);
  
  -- Determine notification type and title
  IF TG_OP = 'INSERT' THEN
    notification_type := 'created';
    complaint_title := 'New complaint: ' || NEW.title;
    
    -- Notify appropriate staff based on category and district
    FOR recipient_record IN 
      SELECT user_id, role, priority_order 
      FROM get_complaint_recipients(NEW.category, NEW.district_id, NEW.escalation_level)
    LOOP
      -- Insert in-app notification
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
        complaint_title,
        CONCAT(complainant_name, ' submitted a ', NEW.category, ' complaint'),
        'complaint',
        NEW.category,
        NEW.id,
        'complaints',
        NEW.complainant_id,
        NOW(),
        CASE WHEN NEW.priority = 'high' THEN 'high' ELSE 'normal' END,
        jsonb_build_object(
          'escalation_level', NEW.escalation_level,
          'assigned_role', recipient_record.role,
          'priority_order', recipient_record.priority_order
        )
      );
      
      -- Track complaint notification
      INSERT INTO complaint_notifications (
        complaint_id,
        recipient_id,
        notification_type,
        metadata
      ) VALUES (
        NEW.id,
        recipient_record.user_id,
        notification_type,
        jsonb_build_object(
          'role', recipient_record.role,
          'priority_order', recipient_record.priority_order,
          'category', NEW.category
        )
      );
    END LOOP;
    
    RETURN NEW;
  END IF;

  -- Handle status updates
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    notification_type := 'updated';
    
    -- Notify complainant
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
      NEW.complainant_id,
      CONCAT('Complaint ', NEW.status),
      CONCAT('Your complaint "', NEW.title, '" has been ', NEW.status),
      'complaint',
      NEW.category,
      NEW.id,
      'complaints',
      NEW.assigned_to,
      NOW()
    );
    
    RETURN NEW;
  END IF;

  -- Handle escalation
  IF TG_OP = 'UPDATE' AND OLD.escalation_level != NEW.escalation_level THEN
    notification_type := 'escalated';
    
    -- Notify higher-level staff
    FOR recipient_record IN 
      SELECT user_id, role, priority_order 
      FROM get_complaint_recipients(NEW.category, NEW.district_id, NEW.escalation_level)
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
        priority
      ) VALUES (
        recipient_record.user_id,
        'Complaint Escalated: ' || NEW.title,
        CONCAT('Complaint escalated to level ', NEW.escalation_level, ' - ', NEW.category),
        'complaint',
        NEW.category,
        NEW.id,
        'complaints',
        NEW.escalated_by,
        NOW(),
        'high'
      );
      
      INSERT INTO complaint_notifications (
        complaint_id,
        recipient_id,
        notification_type,
        metadata
      ) VALUES (
        NEW.id,
        recipient_record.user_id,
        notification_type,
        jsonb_build_object(
          'escalation_level', NEW.escalation_level,
          'role', recipient_record.role,
          'escalated_by', NEW.escalated_by
        )
      );
    END LOOP;
    
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Fix auto_escalate_complaints function
CREATE OR REPLACE FUNCTION auto_escalate_complaints()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  complaint_record RECORD;
BEGIN
  -- Auto-escalate complaints that have been pending for more than 24 hours
  FOR complaint_record IN
    SELECT id, title, category, district_id, escalation_level, created_at
    FROM complaints
    WHERE status = 'pending'
      AND escalation_level < 2
      AND (
        (escalation_level = 0 AND created_at < NOW() - INTERVAL '24 hours') OR
        (escalation_level = 1 AND escalated_at < NOW() - INTERVAL '48 hours')
      )
      AND auto_escalated = false
  LOOP
    -- Escalate the complaint
    UPDATE complaints 
    SET 
      escalation_level = escalation_level + 1,
      escalated_at = NOW(),
      auto_escalated = true,
      updated_at = NOW()
    WHERE id = complaint_record.id;
    
    -- Log the auto-escalation
    INSERT INTO audit_logs (
      table_name,
      action,
      record_id,
      new_values,
      timestamp
    ) VALUES (
      'complaints',
      'auto_escalate',
      complaint_record.id,
      jsonb_build_object(
        'escalation_level', complaint_record.escalation_level + 1,
        'auto_escalated', true,
        'reason', 'timeout'
      ),
      NOW()
    );
  END LOOP;
END;
$$;

-- Fix mark_complaint_notification_read function
CREATE OR REPLACE FUNCTION mark_complaint_notification_read(notification_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE complaint_notifications 
  SET read_at = NOW()
  WHERE id = notification_id 
    AND recipient_id = auth.uid()
    AND read_at IS NULL;
    
  RETURN FOUND;
END;
$$;

-- Create cron job for auto-escalation (runs every hour)
SELECT cron.schedule(
  'auto-escalate-complaints',
  '0 * * * *', -- Every hour at minute 0
  'SELECT auto_escalate_complaints();'
);