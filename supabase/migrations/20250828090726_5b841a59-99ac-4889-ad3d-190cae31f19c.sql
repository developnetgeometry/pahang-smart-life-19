-- Add product-specific fields to advertisements table for better marketplace support
ALTER TABLE public.advertisements 
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN currency TEXT DEFAULT 'MYR',
ADD COLUMN stock_quantity INTEGER,
ADD COLUMN low_stock_alert INTEGER DEFAULT 5,
ADD COLUMN is_in_stock BOOLEAN DEFAULT true,
ADD COLUMN shipping_required BOOLEAN DEFAULT false,
ADD COLUMN shipping_cost DECIMAL(8,2),
ADD COLUMN product_weight DECIMAL(8,2),
ADD COLUMN product_dimensions TEXT,
ADD COLUMN condition_status TEXT DEFAULT 'new',
ADD COLUMN warranty_period TEXT,
ADD COLUMN return_policy TEXT,
ADD COLUMN product_type TEXT DEFAULT 'service' CHECK (product_type IN ('service', 'product', 'both'));

-- Add indexes for better performance
CREATE INDEX idx_advertisements_price ON public.advertisements(price);
CREATE INDEX idx_advertisements_product_type ON public.advertisements(product_type);
CREATE INDEX idx_advertisements_is_in_stock ON public.advertisements(is_in_stock);

-- Update existing records to have proper product_type
UPDATE public.advertisements 
SET product_type = 'service' 
WHERE product_type IS NULL;