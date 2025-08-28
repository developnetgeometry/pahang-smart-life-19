-- First check what columns exist in marketplace_items table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'marketplace_items' 
AND table_schema = 'public';