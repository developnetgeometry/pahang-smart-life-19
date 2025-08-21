-- Create directory_contacts table for community contacts
CREATE TABLE public.directory_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  hours TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  category TEXT NOT NULL CHECK (category IN ('management', 'security', 'maintenance', 'community', 'services')),
  district_id UUID REFERENCES districts(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.directory_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view directory contacts in their district" 
ON public.directory_contacts 
FOR SELECT 
USING (district_id = get_user_district() OR district_id IS NULL);

CREATE POLICY "Management can manage directory contacts" 
ON public.directory_contacts 
FOR ALL 
USING (has_role('admin'::user_role) OR has_role('manager'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));

-- Insert default directory contacts
INSERT INTO public.directory_contacts (name, role, phone, email, hours, location, status, category) VALUES
-- Management
('Management Office', 'General Inquiries', '+60 3-2345-6789', 'management@community.com', 'Mon-Fri 9AM-5PM', 'Ground Floor, Block A', 'available', 'management'),
('Property Manager', 'John Smith', '+60 3-2345-6790', 'john.smith@community.com', 'Mon-Fri 9AM-5PM', 'Ground Floor, Block A', 'available', 'management'),

-- Security
('Security Office', '24/7 Security', '+60 3-2345-6700', 'security@community.com', '24 Hours', 'Main Gate', 'available', 'security'),
('Security Supervisor', 'Ahmad Rahman', '+60 12-345-6701', null, 'Mon-Fri 7AM-7PM', 'Main Gate', 'available', 'security'),

-- Maintenance
('Maintenance Team', 'Repairs & Maintenance', '+60 3-2345-6701', 'maintenance@community.com', 'Mon-Sat 8AM-6PM', 'Basement, Block B', 'busy', 'maintenance'),
('Facilities Manager', 'David Lee', '+60 12-345-6702', null, 'Mon-Fri 8AM-5PM', 'Basement, Block B', 'available', 'maintenance'),

-- Community Leaders
('Community Leader', 'Mrs. Siti Rahman', '+60 12-345-6789', null, 'By Appointment', 'Unit A-12-05', 'available', 'community'),
('Residents Committee', 'Committee Members', '+60 12-345-6790', null, 'Weekends 10AM-12PM', 'Community Hall', 'available', 'community'),

-- Services
('Cleaning Services', 'Daily Cleaning', '+60 3-2345-6702', null, 'Daily 6AM-10AM', 'Various Locations', 'available', 'services'),
('Landscaping Team', 'Garden Maintenance', '+60 12-345-6703', null, 'Mon-Fri 7AM-3PM', 'Garden Areas', 'available', 'services');

-- Create default notification preferences for existing users
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  announcement_notifications BOOLEAN NOT NULL DEFAULT true,
  maintenance_notifications BOOLEAN NOT NULL DEFAULT true,
  security_notifications BOOLEAN NOT NULL DEFAULT true,
  community_notifications BOOLEAN NOT NULL DEFAULT true,
  emergency_notifications BOOLEAN NOT NULL DEFAULT true,
  marketing_notifications BOOLEAN NOT NULL DEFAULT false,
  chat_notifications BOOLEAN NOT NULL DEFAULT true,
  booking_notifications BOOLEAN NOT NULL DEFAULT true,
  complaint_notifications BOOLEAN NOT NULL DEFAULT true,
  directory_notifications BOOLEAN NOT NULL DEFAULT true,
  marketplace_notifications BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notification preferences" 
ON public.notification_preferences 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences" 
ON public.notification_preferences 
FOR ALL 
USING (user_id = auth.uid());

-- Insert default preferences for existing users
INSERT INTO public.notification_preferences (user_id)
SELECT id FROM profiles 
ON CONFLICT (user_id) DO NOTHING;

-- Create trigger to auto-create preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_notification_preferences_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Create updated_at trigger for both tables
CREATE TRIGGER update_directory_contacts_updated_at
  BEFORE UPDATE ON public.directory_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();