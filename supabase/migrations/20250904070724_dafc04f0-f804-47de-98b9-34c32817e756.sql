-- Create trigger to automatically notify message recipients
CREATE TRIGGER notify_message_recipients_trigger
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_message_recipients();

-- Also ensure that chat room members can receive notifications  
-- by adding any missing columns to notifications table if needed
DO $$
BEGIN
    -- Check if reference_id column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'reference_id') THEN
        ALTER TABLE notifications ADD COLUMN reference_id UUID;
    END IF;
    
    -- Check if reference_table column exists, if not add it  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'reference_table') THEN
        ALTER TABLE notifications ADD COLUMN reference_table TEXT;
    END IF;
END $$;