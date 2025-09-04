-- Drop existing constraint if it exists and recreate it properly
DO $$ 
BEGIN
    -- Drop constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'announcement_comments_user_id_fkey' 
        AND table_name = 'announcement_comments'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE announcement_comments DROP CONSTRAINT announcement_comments_user_id_fkey;
    END IF;
    
    -- Create the foreign key constraint
    ALTER TABLE announcement_comments 
    ADD CONSTRAINT announcement_comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    
    -- Refresh the schema cache by altering the table (this forces PostgREST to reload schema)
    COMMENT ON TABLE announcement_comments IS 'Comments on announcements - schema refreshed ' || NOW();
    
END $$;