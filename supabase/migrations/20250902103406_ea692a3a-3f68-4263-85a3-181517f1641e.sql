-- Add foreign key constraint between marketplace_items and profiles
ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;