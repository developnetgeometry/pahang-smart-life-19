-- Add unique constraint to enhanced_user_roles table
ALTER TABLE enhanced_user_roles 
ADD CONSTRAINT enhanced_user_roles_user_role_unique 
UNIQUE (user_id, role);