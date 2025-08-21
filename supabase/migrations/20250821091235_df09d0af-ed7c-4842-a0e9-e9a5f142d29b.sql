-- Create directory_contacts table for community contacts (only if not exists)
CREATE TABLE IF NOT EXISTS public.directory_contacts (
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

-- Enable RLS only if table was created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'directory_contacts'
  ) THEN
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

    -- Create updated_at trigger
    CREATE TRIGGER update_directory_contacts_updated_at
      BEFORE UPDATE ON public.directory_contacts
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Insert default directory contacts if table is empty
INSERT INTO public.directory_contacts (name, role, phone, email, hours, location, status, category) 
SELECT * FROM (VALUES
  ('Management Office', 'General Inquiries', '+60 3-2345-6789', 'management@community.com', 'Mon-Fri 9AM-5PM', 'Ground Floor, Block A', 'available', 'management'),
  ('Property Manager', 'John Smith', '+60 3-2345-6790', 'john.smith@community.com', 'Mon-Fri 9AM-5PM', 'Ground Floor, Block A', 'available', 'management'),
  ('Security Office', '24/7 Security', '+60 3-2345-6700', 'security@community.com', '24 Hours', 'Main Gate', 'available', 'security'),
  ('Security Supervisor', 'Ahmad Rahman', '+60 12-345-6701', null, 'Mon-Fri 7AM-7PM', 'Main Gate', 'available', 'security'),
  ('Maintenance Team', 'Repairs & Maintenance', '+60 3-2345-6701', 'maintenance@community.com', 'Mon-Sat 8AM-6PM', 'Basement, Block B', 'busy', 'maintenance'),
  ('Facilities Manager', 'David Lee', '+60 12-345-6702', null, 'Mon-Fri 8AM-5PM', 'Basement, Block B', 'available', 'maintenance'),
  ('Community Leader', 'Mrs. Siti Rahman', '+60 12-345-6789', null, 'By Appointment', 'Unit A-12-05', 'available', 'community'),
  ('Residents Committee', 'Committee Members', '+60 12-345-6790', null, 'Weekends 10AM-12PM', 'Community Hall', 'available', 'community'),
  ('Cleaning Services', 'Daily Cleaning', '+60 3-2345-6702', null, 'Daily 6AM-10AM', 'Various Locations', 'available', 'services'),
  ('Landscaping Team', 'Garden Maintenance', '+60 12-345-6703', null, 'Mon-Fri 7AM-3PM', 'Garden Areas', 'available', 'services')
) AS v(name, role, phone, email, hours, location, status, category)
WHERE NOT EXISTS (SELECT 1 FROM public.directory_contacts LIMIT 1);