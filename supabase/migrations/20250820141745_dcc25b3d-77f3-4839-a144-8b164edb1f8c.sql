-- Create panic_alerts table to store emergency alerts
CREATE TABLE public.panic_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT,
  alert_status TEXT NOT NULL DEFAULT 'active' CHECK (alert_status IN ('active', 'responded', 'resolved', 'false_alarm')),
  response_time TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  district_id UUID REFERENCES districts(id)
);

-- Enable RLS
ALTER TABLE public.panic_alerts ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own panic alerts
CREATE POLICY "Users can create panic alerts" 
ON public.panic_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own panic alerts
CREATE POLICY "Users can view their own panic alerts" 
ON public.panic_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow security and management to view all panic alerts in their district
CREATE POLICY "Security can view all panic alerts" 
ON public.panic_alerts 
FOR SELECT 
USING (
  has_role('security'::user_role) OR 
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);

-- Allow security and management to update panic alerts (respond to them)
CREATE POLICY "Security can update panic alerts" 
ON public.panic_alerts 
FOR UPDATE 
USING (
  has_role('security'::user_role) OR 
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);

-- Create trigger to update updated_at column
CREATE TRIGGER update_panic_alerts_updated_at
  BEFORE UPDATE ON public.panic_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create notifications table if it doesn't exist (for panic alert notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'panic')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on notifications if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for notifications if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Users can view their notifications'
  ) THEN
    CREATE POLICY "Users can view their notifications" 
    ON public.notifications 
    FOR SELECT 
    USING (auth.uid() = recipient_id);
  END IF;
END
$$;