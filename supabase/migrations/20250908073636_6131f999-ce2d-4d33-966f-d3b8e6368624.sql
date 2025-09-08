-- Fix the enhanced_notify_complaint_creation function to include user_id in module_activities insert
CREATE OR REPLACE FUNCTION public.enhanced_notify_complaint_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Log creation activity (now includes user_id)
  INSERT INTO module_activities (
    user_id,
    module_name,
    reference_table,
    reference_id,
    activity_type,
    description,
    performed_by,
    performed_by_role,
    metadata
  ) VALUES (
    NEW.complainant_id,  -- Add the missing user_id
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
$function$;