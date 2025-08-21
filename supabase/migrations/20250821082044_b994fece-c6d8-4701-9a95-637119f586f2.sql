-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_notify_message_recipients ON chat_messages;
DROP TRIGGER IF EXISTS trigger_notify_booking_updates ON bookings;
DROP TRIGGER IF EXISTS trigger_notify_complaint_updates ON complaints;
DROP TRIGGER IF EXISTS trigger_notify_announcement_published ON announcements;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS notify_message_recipients();
DROP FUNCTION IF EXISTS notify_booking_updates();
DROP FUNCTION IF EXISTS notify_complaint_updates();
DROP FUNCTION IF EXISTS notify_announcement_published();

-- Create notification triggers for chat messages
CREATE OR REPLACE FUNCTION notify_message_recipients()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all room members except the sender
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
    crm.user_id,
    CASE 
      WHEN cr.room_type = 'marketplace' THEN 'New message about your product'
      ELSE CONCAT('New message from ', p.full_name)
    END,
    CONCAT(p.full_name, ': ', 
      CASE 
        WHEN LENGTH(NEW.message_text) > 50 
        THEN CONCAT(LEFT(NEW.message_text, 50), '...') 
        ELSE NEW.message_text 
      END
    ),
    'message',
    'message',
    NEW.room_id,
    'chat_messages',
    NEW.sender_id,
    NEW.created_at
  FROM chat_room_members crm
  JOIN chat_rooms cr ON cr.id = crm.room_id
  LEFT JOIN profiles p ON p.id = NEW.sender_id
  WHERE crm.room_id = NEW.room_id 
    AND crm.user_id != NEW.sender_id
    AND NEW.is_deleted = false;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new messages
CREATE TRIGGER trigger_notify_message_recipients
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_message_recipients();

-- Create notification triggers for bookings
CREATE OR REPLACE FUNCTION notify_booking_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify facility managers when new bookings are created
  IF TG_OP = 'INSERT' THEN
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
      'New facility booking',
      CONCAT('New booking request for facility by ', p.full_name),
      'booking',
      'booking',
      NEW.id,
      'bookings',
      NEW.user_id,
      NEW.created_at
    FROM enhanced_user_roles eur
    LEFT JOIN profiles p ON p.id = NEW.user_id
    WHERE eur.role = 'facility_manager'
      AND eur.is_active = true;
      
    RETURN NEW;
  END IF;

  -- Notify user when booking status changes
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
    )
    VALUES (
      NEW.user_id,
      CONCAT('Booking ', NEW.status),
      CONCAT('Your facility booking has been ', NEW.status),
      'booking',
      'booking',
      NEW.id,
      'bookings',
      NEW.approved_by,
      now()
    );
    
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking updates
CREATE TRIGGER trigger_notify_booking_updates
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_updates();

-- Create notification triggers for complaints
CREATE OR REPLACE FUNCTION notify_complaint_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify management when new complaints are created
  IF TG_OP = 'INSERT' THEN
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
      'New complaint submitted',
      CONCAT('New ', NEW.category, ' complaint: ', NEW.title),
      'complaint',
      'complaint',
      NEW.id,
      'complaints',
      NEW.complainant_id,
      NEW.created_at,
      CASE WHEN NEW.priority = 'high' THEN 'high' ELSE 'normal' END
    FROM enhanced_user_roles eur
    WHERE eur.role IN ('facility_manager', 'community_admin', 'district_coordinator', 'state_admin')
      AND eur.is_active = true;
      
    RETURN NEW;
  END IF;

  -- Notify complainant when status changes
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
    )
    VALUES (
      NEW.complainant_id,
      CONCAT('Complaint ', NEW.status),
      CONCAT('Your complaint "', NEW.title, '" has been ', NEW.status),
      'complaint',
      'complaint',
      NEW.id,
      'complaints',
      NEW.assigned_to,
      now()
    );
    
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for complaint updates
CREATE TRIGGER trigger_notify_complaint_updates
  AFTER INSERT OR UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_complaint_updates();

-- Create notification triggers for announcements
CREATE OR REPLACE FUNCTION notify_announcement_published()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify all users in the district when announcements are published
  IF TG_OP = 'INSERT' AND NEW.is_published = true THEN
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
      district_id
    )
    SELECT 
      p.id,
      CASE WHEN NEW.is_urgent THEN CONCAT('🔴 URGENT: ', NEW.title) ELSE NEW.title END,
      LEFT(NEW.content, 100),
      'announcement',
      NEW.type::text,
      NEW.id,
      'announcements',
      NEW.author_id,
      NEW.created_at,
      CASE WHEN NEW.is_urgent THEN 'high' ELSE 'normal' END,
      NEW.district_id
    FROM profiles p
    WHERE p.district_id = NEW.district_id;
      
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for announcement publishing
CREATE TRIGGER trigger_notify_announcement_published
  AFTER INSERT ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION notify_announcement_published();

-- Add missing columns to notification_preferences if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'messages') THEN
    ALTER TABLE notification_preferences ADD COLUMN messages boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'mentions') THEN
    ALTER TABLE notification_preferences ADD COLUMN mentions boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'emergencies') THEN
    ALTER TABLE notification_preferences ADD COLUMN emergencies boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'marketplace') THEN
    ALTER TABLE notification_preferences ADD COLUMN marketplace boolean DEFAULT true;
  END IF;
END $$;