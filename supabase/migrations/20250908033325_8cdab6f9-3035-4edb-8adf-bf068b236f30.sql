-- Add missing description column to module_activities table
ALTER TABLE public.module_activities ADD COLUMN IF NOT EXISTS description TEXT;

-- Update the log_module_activity function to properly handle the description column
CREATE OR REPLACE FUNCTION public.log_module_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log complaint-related activities
  IF TG_TABLE_NAME = 'complaints' THEN
    INSERT INTO public.module_activities (
      user_id,
      module_name,
      activity_type,
      description,
      activity_data,
      reference_id,
      reference_table,
      district_id
    ) VALUES (
      NEW.complainant_id,
      'complaints',
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'complaint_created'
        WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 'complaint_status_updated'
        ELSE 'complaint_updated'
      END,
      CASE 
        WHEN TG_OP = 'INSERT' THEN CONCAT('Created complaint: ', NEW.title)
        WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN CONCAT('Status changed from ', OLD.status, ' to ', NEW.status)
        ELSE CONCAT('Updated complaint: ', NEW.title)
      END,
      jsonb_build_object(
        'title', NEW.title,
        'category', NEW.category,
        'priority', NEW.priority,
        'status', NEW.status
      ),
      NEW.id,
      'complaints',
      NEW.district_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;