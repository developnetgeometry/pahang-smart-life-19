-- Create essential marketplace tables to eliminate hardcoded data

-- Product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories
CREATE POLICY "Everyone can view categories" ON public.product_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.product_categories FOR ALL USING (
  has_enhanced_role('state_admin') OR 
  has_enhanced_role('district_coordinator') OR 
  has_enhanced_role('community_admin')
);

-- Add missing columns to marketplace_items
DO $$ 
BEGIN
  -- Add stock_quantity column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='stock_quantity') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN stock_quantity INTEGER DEFAULT 0;
  END IF;
  
  -- Add category_id column  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='category_id') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN category_id UUID REFERENCES public.product_categories(id);
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