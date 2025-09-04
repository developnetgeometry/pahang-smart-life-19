-- Add missing foreign key constraint for announcement_comments.user_id -> profiles.id
ALTER TABLE announcement_comments 
ADD CONSTRAINT announcement_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;