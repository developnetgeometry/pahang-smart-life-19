-- Create units table for storing community unit information
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_number TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'residential',
  address TEXT,
  community_id UUID REFERENCES public.communities(id),
  district_id UUID REFERENCES public.districts(id),
  coordinates_x NUMERIC NOT NULL, -- X coordinate on the image (percentage)
  coordinates_y NUMERIC NOT NULL, -- Y coordinate on the image (percentage)
  width NUMERIC DEFAULT 8, -- Width of clickable area (percentage)
  height NUMERIC DEFAULT 6, -- Height of clickable area (percentage)
  phone_number TEXT,
  email TEXT,
  occupancy_status TEXT DEFAULT 'occupied',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Create policies for units
CREATE POLICY "Community admins can manage units in their community" 
ON public.units 
FOR ALL 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) AND 
  community_id = get_user_community()
);

CREATE POLICY "District coordinators can manage units in their district" 
ON public.units 
FOR ALL 
USING (
  has_enhanced_role('district_coordinator'::enhanced_user_role) AND 
  district_id = get_user_district()
);

CREATE POLICY "State admins can manage all units" 
ON public.units 
FOR ALL 
USING (has_enhanced_role('state_admin'::enhanced_user_role));

CREATE POLICY "Residents can view units in their district" 
ON public.units 
FOR SELECT 
USING (district_id = get_user_district());

-- Create indexes for better performance
CREATE INDEX idx_units_community_id ON public.units(community_id);
CREATE INDEX idx_units_district_id ON public.units(district_id);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();