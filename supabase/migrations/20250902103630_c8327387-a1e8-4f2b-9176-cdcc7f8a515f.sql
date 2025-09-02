-- Add foreign key constraint from marketplace_items.seller_id to profiles.id
ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_seller_id_profiles_fkey 
FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE SET NULL;