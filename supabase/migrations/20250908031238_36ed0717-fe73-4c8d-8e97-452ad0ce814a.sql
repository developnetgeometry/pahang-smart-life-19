-- Create module_activities table for tracking user activities
CREATE TABLE IF NOT EXISTS public.module_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}'::jsonb,
  reference_id UUID,
  reference_table TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_module_activities_user_id ON public.module_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_module_activities_module_name ON public.module_activities(module_name);
CREATE INDEX IF NOT EXISTS idx_module_activities_created_at ON public.module_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_module_activities_reference ON public.module_activities(reference_table, reference_id);

-- Enable RLS on the table
ALTER TABLE public.module_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activities"
ON public.module_activities FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own activities"
ON public.module_activities FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all activities"
ON public.module_activities FOR SELECT
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Create function to log module activities
CREATE OR REPLACE FUNCTION log_module_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log complaint-related activities
  IF TG_TABLE_NAME = 'complaints' THEN
    INSERT INTO public.module_activities (
      user_id,
      module_name,
      activity_type,
      activity_data,
      reference_id,
      reference_table,
      district_id
    ) VALUES (
      NEW.complainant_id,
      'complaints',
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'complaint_created'
        WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 'complaint_status_updated'
        ELSE 'complaint_updated'
      END,
      jsonb_build_object(
        'title', NEW.title,
        'category', NEW.category,
        'priority', NEW.priority,
        'status', NEW.status
      ),
      NEW.id,
      'complaints',
      NEW.district_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;