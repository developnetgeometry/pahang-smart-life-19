-- Check the constraint definition for seller_type
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'marketplace_items_seller_type_check';