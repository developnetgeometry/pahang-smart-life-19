-- Create advertisements table for service providers
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  business_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  website_url TEXT,
  category TEXT NOT NULL DEFAULT 'services',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Create policies for advertisements
CREATE POLICY "Service providers can create advertisements"
ON public.advertisements
FOR INSERT
WITH CHECK (
  advertiser_id = auth.uid() AND
  has_enhanced_role('service_provider'::enhanced_user_role)
);

CREATE POLICY "Service providers can update their own advertisements"
ON public.advertisements
FOR UPDATE
USING (
  advertiser_id = auth.uid() AND
  has_enhanced_role('service_provider'::enhanced_user_role)
);

CREATE POLICY "Service providers can view their own advertisements"
ON public.advertisements
FOR SELECT
USING (advertiser_id = auth.uid());

CREATE POLICY "Everyone can view active advertisements"
ON public.advertisements
FOR SELECT
USING (
  is_active = true AND
  (start_date IS NULL OR start_date <= now()) AND
  (end_date IS NULL OR end_date > now())
);

CREATE POLICY "Admins can manage all advertisements"
ON public.advertisements
FOR ALL
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_advertisements_active ON public.advertisements(is_active, start_date, end_date);
CREATE INDEX idx_advertisements_district ON public.advertisements(district_id);
CREATE INDEX idx_advertisements_featured ON public.advertisements(is_featured) WHERE is_featured = true;