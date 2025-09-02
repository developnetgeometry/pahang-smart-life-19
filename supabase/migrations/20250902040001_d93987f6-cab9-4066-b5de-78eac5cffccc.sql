-- Create missing tables
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID NOT NULL,
  product_id UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);

-- Enable RLS on missing tables
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for wishlists
DROP POLICY IF EXISTS "Users can create wishlists" ON public.wishlists;
CREATE POLICY "Users can create wishlists" ON public.wishlists
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own wishlists" ON public.wishlists;
CREATE POLICY "Users can update their own wishlists" ON public.wishlists
  FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can view public wishlists and their own" ON public.wishlists;
CREATE POLICY "Users can view public wishlists and their own" ON public.wishlists
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- Add RLS policies for wishlist items
DROP POLICY IF EXISTS "Users can manage their wishlist items" ON public.wishlist_items;
CREATE POLICY "Users can manage their wishlist items" ON public.wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlists w 
      WHERE w.id = wishlist_items.wishlist_id AND w.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view wishlist items for accessible wishlists" ON public.wishlist_items;
CREATE POLICY "Users can view wishlist items for accessible wishlists" ON public.wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists w 
      WHERE w.id = wishlist_items.wishlist_id 
      AND (w.is_public = true OR w.created_by = auth.uid())
    )
  );

-- Add foreign key constraints for missing tables
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_wishlist_items_wishlist'
  ) THEN
    ALTER TABLE public.wishlist_items
      ADD CONSTRAINT fk_wishlist_items_wishlist FOREIGN KEY (wishlist_id) REFERENCES public.wishlists(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_wishlist_items_product'
  ) THEN
    ALTER TABLE public.wishlist_items
      ADD CONSTRAINT fk_wishlist_items_product FOREIGN KEY (product_id) REFERENCES public.marketplace_items(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_wishlists_updated_at ON public.wishlists;
CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample wishlist data
INSERT INTO public.wishlists (name, description, created_by, is_public) 
VALUES 
('Sample Home Essentials', 'Items for new apartment setup', (SELECT id FROM auth.users LIMIT 1), true),
('Sample Tech Gadgets', 'Latest technology items', (SELECT id FROM auth.users LIMIT 1), true)
ON CONFLICT DO NOTHING;