-- Add seller_type column to marketplace_items table
ALTER TABLE public.marketplace_items 
ADD COLUMN seller_type text NOT NULL DEFAULT 'resident' 
CHECK (seller_type IN ('resident', 'service_provider'));

-- Add index for better performance
CREATE INDEX idx_marketplace_items_seller_type ON public.marketplace_items(seller_type);

-- Update existing items to set seller_type based on user roles
-- Service providers will have seller_type = 'service_provider'
UPDATE public.marketplace_items 
SET seller_type = 'service_provider'
WHERE seller_id IN (
  SELECT DISTINCT eur.user_id 
  FROM enhanced_user_roles eur 
  WHERE eur.role = 'service_provider' AND eur.is_active = true
);