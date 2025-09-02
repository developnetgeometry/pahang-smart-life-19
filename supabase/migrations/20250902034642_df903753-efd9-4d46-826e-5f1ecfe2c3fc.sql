-- Add essential columns to marketplace_items to eliminate hardcoded data

-- Add missing columns to marketplace_items
DO $$ 
BEGIN
  -- Add stock_quantity column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='stock_quantity') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN stock_quantity INTEGER DEFAULT 0;
  END IF;
  
  -- Add sku column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='sku') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN sku TEXT UNIQUE;
  END IF;
  
  -- Add weight column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='weight') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN weight DECIMAL(8,2);
  END IF;
  
  -- Add dimensions column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='dimensions') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN dimensions TEXT;
  END IF;
  
  -- Add view_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='view_count') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;