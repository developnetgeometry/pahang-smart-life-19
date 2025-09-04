-- Create storage bucket for floor plan images
INSERT INTO storage.buckets (id, name, public) VALUES ('floor-plan-images', 'floor-plan-images', true);

-- Create storage policies for floor plan images
CREATE POLICY "Floor plan images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'floor-plan-images');

CREATE POLICY "Admins can upload floor plan images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'floor-plan-images' AND has_enhanced_role('community_admin'::enhanced_user_role));

CREATE POLICY "Admins can update floor plan images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'floor-plan-images' AND has_enhanced_role('community_admin'::enhanced_user_role));

CREATE POLICY "Admins can delete floor plan images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'floor-plan-images' AND has_enhanced_role('community_admin'::enhanced_user_role));

-- Create floor plan migration history table
CREATE TABLE public.floor_plan_migrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_floor_plan_id UUID REFERENCES floor_plans(id) ON DELETE SET NULL,
  to_floor_plan_id UUID NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
  migration_type TEXT NOT NULL DEFAULT 'layout_change',
  units_affected INTEGER NOT NULL DEFAULT 0,
  migration_data JSONB DEFAULT '{}',
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on floor plan migrations
ALTER TABLE public.floor_plan_migrations ENABLE ROW LEVEL SECURITY;

-- Create policies for floor plan migrations
CREATE POLICY "Admins can manage floor plan migrations" 
ON public.floor_plan_migrations 
FOR ALL 
USING (has_enhanced_role('community_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role) OR has_enhanced_role('state_admin'::enhanced_user_role));

-- Create function to backup unit coordinates before migration
CREATE OR REPLACE FUNCTION public.backup_unit_coordinates_before_migration()
RETURNS TRIGGER AS $$
DECLARE
  unit_backup JSONB;
BEGIN
  -- Collect all unit coordinates for the old floor plan
  SELECT jsonb_agg(
    jsonb_build_object(
      'unit_id', id,
      'unit_number', unit_number,
      'x', x,
      'y', y,
      'width', width,
      'height', height,
      'owner_name', owner_name
    )
  ) INTO unit_backup
  FROM units 
  WHERE floor_plan_id = OLD.id;
  
  -- Store backup in migration record
  UPDATE floor_plan_migrations 
  SET migration_data = migration_data || jsonb_build_object('unit_backup', unit_backup)
  WHERE to_floor_plan_id = NEW.id 
  AND performed_at > (now() - INTERVAL '1 minute');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create unit coordinate backup table for safety
CREATE TABLE public.unit_coordinate_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  floor_plan_id UUID NOT NULL,
  unit_data JSONB NOT NULL,
  backup_reason TEXT NOT NULL DEFAULT 'migration',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on unit coordinate backups
ALTER TABLE public.unit_coordinate_backups ENABLE ROW LEVEL SECURITY;

-- Create policies for unit coordinate backups
CREATE POLICY "Admins can manage unit coordinate backups" 
ON public.unit_coordinate_backups 
FOR ALL 
USING (has_enhanced_role('community_admin'::enhanced_user_role) OR has_enhanced_role('district_coordinator'::enhanced_user_role) OR has_enhanced_role('state_admin'::enhanced_user_role));

-- Add indexes for better performance
CREATE INDEX idx_floor_plan_migrations_floor_plan_id ON floor_plan_migrations(to_floor_plan_id);
CREATE INDEX idx_floor_plan_migrations_performed_at ON floor_plan_migrations(performed_at);
CREATE INDEX idx_unit_coordinate_backups_floor_plan_id ON unit_coordinate_backups(floor_plan_id);
CREATE INDEX idx_unit_coordinate_backups_created_at ON unit_coordinate_backups(created_at);