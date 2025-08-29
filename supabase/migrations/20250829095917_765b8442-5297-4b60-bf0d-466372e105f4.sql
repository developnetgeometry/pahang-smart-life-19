-- Create enhanced complaint notification system with escalation

-- Add escalation fields to complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS escalated_by UUID REFERENCES auth.users(id);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS auto_escalated BOOLEAN DEFAULT FALSE;

-- Create complaint notifications table for tracking
CREATE TABLE IF NOT EXISTS complaint_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('created', 'assigned', 'updated', 'escalated', 'resolved')),
  sent_via TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'push'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE complaint_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for complaint_notifications
CREATE POLICY "Users can view their own notifications"
ON complaint_notifications FOR SELECT
USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON complaint_notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Management can view all notifications"
ON complaint_notifications FOR ALL
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role) OR
  has_enhanced_role('facility_manager'::enhanced_user_role) OR
  has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
  has_enhanced_role('security_officer'::enhanced_user_role)
);

-- Create function to get appropriate staff by complaint category and district
CREATE OR REPLACE FUNCTION get_complaint_recipients(
  p_category TEXT,
  p_district_id UUID,
  p_escalation_level INTEGER DEFAULT 0
) RETURNS TABLE (
  user_id UUID,
  role enhanced_user_role,
  priority_order INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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

-- Enhanced complaint notification function
CREATE OR REPLACE FUNCTION notify_complaint_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create auto-escalation function
CREATE OR REPLACE FUNCTION auto_escalate_complaints()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_complaint_notification_read(notification_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Drop existing trigger to replace it
DROP TRIGGER IF EXISTS notify_complaint_updates ON complaints;

-- Create trigger for complaint notifications
CREATE TRIGGER notify_complaint_updates
  AFTER INSERT OR UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_complaint_updates();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaint_notifications_recipient_unread 
ON complaint_notifications (recipient_id, read_at) WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_complaint_notifications_complaint_type 
ON complaint_notifications (complaint_id, notification_type);

CREATE INDEX IF NOT EXISTS idx_complaints_escalation_status 
ON complaints (status, escalation_level, created_at, escalated_at);