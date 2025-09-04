-- Create the foreign key constraint for announcement comments
ALTER TABLE announcement_comments 
ADD CONSTRAINT announcement_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;