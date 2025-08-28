-- Create marketplace_items table for community marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair')),
  location TEXT,
  image TEXT,
  district_id UUID,
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view active marketplace items" 
ON public.marketplace_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own marketplace items" 
ON public.marketplace_items 
FOR INSERT 
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own marketplace items" 
ON public.marketplace_items 
FOR UPDATE 
USING (seller_id = auth.uid());

CREATE POLICY "Users can delete their own marketplace items" 
ON public.marketplace_items 
FOR DELETE 
USING (seller_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_marketplace_items_active ON public.marketplace_items (is_active, created_at DESC);
CREATE INDEX idx_marketplace_items_category ON public.marketplace_items (category);
CREATE INDEX idx_marketplace_items_district ON public.marketplace_items (district_id);

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_items_updated_at
BEFORE UPDATE ON public.marketplace_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();