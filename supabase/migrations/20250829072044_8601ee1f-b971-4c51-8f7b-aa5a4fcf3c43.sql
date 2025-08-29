-- Create floor_plans table to manage different floor plan images
CREATE TABLE public.floor_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  district_id UUID REFERENCES public.districts(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add floor_plan_id to units table to link units to specific floor plans
ALTER TABLE public.units 
ADD COLUMN floor_plan_id UUID REFERENCES public.floor_plans(id);

-- Enable RLS on floor_plans table
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for floor_plans
CREATE POLICY "Community admins can manage floor plans in their district" 
ON public.floor_plans 
FOR ALL 
USING (has_enhanced_role('community_admin'::enhanced_user_role) AND district_id = get_user_district());

CREATE POLICY "Higher level admins can manage all floor plans" 
ON public.floor_plans 
FOR ALL 
USING (has_enhanced_role('district_coordinator'::enhanced_user_role) OR has_enhanced_role('state_admin'::enhanced_user_role));

CREATE POLICY "Users can view floor plans in their district" 
ON public.floor_plans 
FOR SELECT 
USING (district_id = get_user_district() AND is_active = true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_floor_plans_updated_at
BEFORE UPDATE ON public.floor_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();