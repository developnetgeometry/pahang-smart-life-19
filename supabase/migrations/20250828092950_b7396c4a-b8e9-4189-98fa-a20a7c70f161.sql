-- Get some item IDs from the newly inserted items to add to cart
WITH item_ids AS (
  SELECT id FROM marketplace_items 
  WHERE seller_id = 'bfe88021-d76b-4f65-8b43-1b879ad4617a' 
  ORDER BY created_at DESC 
  LIMIT 4
),
cart_data AS (
  SELECT 
    ROW_NUMBER() OVER() as rn,
    id,
    CASE 
      WHEN ROW_NUMBER() OVER() = 1 THEN 2
      WHEN ROW_NUMBER() OVER() = 2 THEN 1  
      WHEN ROW_NUMBER() OVER() = 3 THEN 3
      ELSE 1
    END as quantity,
    CASE 
      WHEN ROW_NUMBER() OVER() = 1 THEN now() - INTERVAL '2 hours'
      WHEN ROW_NUMBER() OVER() = 2 THEN now() - INTERVAL '1 day'
      WHEN ROW_NUMBER() OVER() = 3 THEN now() - INTERVAL '3 hours'
      ELSE now() - INTERVAL '5 hours'
    END as added_time
  FROM item_ids
)
INSERT INTO shopping_cart (user_id, item_id, quantity, added_at)
SELECT 
  'bfe88021-d76b-4f65-8b43-1b879ad4617a',
  id,
  quantity,
  added_time
FROM cart_data
ON CONFLICT (user_id, item_id) DO NOTHING;