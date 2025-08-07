-- Create enums for various statuses and roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'security_guard', 'maintenance_staff');
CREATE TYPE public.complaint_status AS ENUM ('pending', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.visitor_status AS ENUM ('pending', 'approved', 'checked_in', 'checked_out', 'rejected');
CREATE TYPE public.announcement_type AS ENUM ('general', 'emergency', 'maintenance', 'event');
CREATE TYPE public.marketplace_status AS ENUM ('active', 'sold', 'inactive');
CREATE TYPE public.sensor_type AS ENUM ('temperature', 'humidity', 'air_quality', 'noise', 'motion', 'smoke');

-- Districts table
CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  district_id UUID REFERENCES public.districts(id),
  unit_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  vehicle_plate_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Complaint categories table
CREATE TABLE public.complaint_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.complaint_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  status complaint_status DEFAULT 'pending',
  priority complaint_priority DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Facilities table
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  hourly_rate DECIMAL(10,2),
  available_hours TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  facility_id UUID REFERENCES public.facilities(id) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  total_amount DECIMAL(10,2),
  status booking_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visitors table
CREATE TABLE public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  visitor_ic TEXT,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  purpose TEXT,
  status visitor_status DEFAULT 'pending',
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type announcement_type DEFAULT 'general',
  priority INTEGER DEFAULT 1,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  district_id UUID REFERENCES public.districts(id),
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion categories table
CREATE TABLE public.discussion_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussions table
CREATE TABLE public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.discussion_categories(id),
  district_id UUID REFERENCES public.districts(id),
  is_pinned BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion replies table
CREATE TABLE public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES public.discussion_replies(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace categories table
CREATE TABLE public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace items table
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.marketplace_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  condition TEXT,
  location TEXT,
  status marketplace_status DEFAULT 'active',
  image_urls TEXT[],
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CCTV cameras table
CREATE TABLE public.cctv_cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  ip_address INET,
  stream_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  district_id UUID REFERENCES public.districts(id),
  installed_date DATE,
  last_maintenance TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensors table
CREATE TABLE public.sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type sensor_type NOT NULL,
  location TEXT NOT NULL,
  district_id UUID REFERENCES public.districts(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_reading JSONB,
  last_reading_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor readings table
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES public.sensors(id) ON DELETE CASCADE NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit TEXT,
  metadata JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cctv_cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_districts_updated_at
  BEFORE UPDATE ON public.districts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
  BEFORE UPDATE ON public.discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_items_updated_at
  BEFORE UPDATE ON public.marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cctv_cameras_updated_at
  BEFORE UPDATE ON public.cctv_cameras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sensors_updated_at
  BEFORE UPDATE ON public.sensors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for Districts
CREATE POLICY "Districts are viewable by everyone" ON public.districts
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage districts" ON public.districts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for User Roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Complaint Categories
CREATE POLICY "Complaint categories are viewable by authenticated users" ON public.complaint_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage complaint categories" ON public.complaint_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Complaints
CREATE POLICY "Users can view their own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints" ON public.complaints
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can view and manage all complaints" ON public.complaints
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator') OR
    public.has_role(auth.uid(), 'maintenance_staff')
  );

-- RLS Policies for Facilities
CREATE POLICY "Facilities are viewable by authenticated users" ON public.facilities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage facilities" ON public.facilities
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all bookings" ON public.bookings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Visitors
CREATE POLICY "Users can view their own visitors" ON public.visitors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create visitor registrations" ON public.visitors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visitor registrations" ON public.visitors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Security guards can view and manage all visitors" ON public.visitors
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'security_guard')
  );

-- RLS Policies for Announcements
CREATE POLICY "Announcements are viewable by authenticated users" ON public.announcements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and moderators can manage announcements" ON public.announcements
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

-- RLS Policies for Discussion Categories
CREATE POLICY "Discussion categories are viewable by authenticated users" ON public.discussion_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage discussion categories" ON public.discussion_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Discussions
CREATE POLICY "Discussions are viewable by authenticated users" ON public.discussions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create discussions" ON public.discussions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own discussions" ON public.discussions
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Moderators can manage all discussions" ON public.discussions
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

-- RLS Policies for Discussion Replies
CREATE POLICY "Discussion replies are viewable by authenticated users" ON public.discussion_replies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create replies" ON public.discussion_replies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies" ON public.discussion_replies
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Moderators can manage all replies" ON public.discussion_replies
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

-- RLS Policies for Marketplace Categories
CREATE POLICY "Marketplace categories are viewable by authenticated users" ON public.marketplace_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage marketplace categories" ON public.marketplace_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Marketplace Items
CREATE POLICY "Marketplace items are viewable by authenticated users" ON public.marketplace_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create marketplace items" ON public.marketplace_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own marketplace items" ON public.marketplace_items
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own marketplace items" ON public.marketplace_items
  FOR DELETE USING (auth.uid() = seller_id);

-- RLS Policies for CCTV Cameras
CREATE POLICY "CCTV cameras are viewable by security staff" ON public.cctv_cameras
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'security_guard')
  );

CREATE POLICY "Only admins can manage CCTV cameras" ON public.cctv_cameras
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Sensors
CREATE POLICY "Sensors are viewable by authenticated users" ON public.sensors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage sensors" ON public.sensors
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Sensor Readings
CREATE POLICY "Sensor readings are viewable by authenticated users" ON public.sensor_readings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only system can insert sensor readings" ON public.sensor_readings
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_profiles_district_id ON public.profiles(district_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_category_id ON public.complaints(category_id);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_facility_id ON public.bookings(facility_id);
CREATE INDEX idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_visitors_user_id ON public.visitors(user_id);
CREATE INDEX idx_visitors_visit_date ON public.visitors(visit_date);
CREATE INDEX idx_visitors_status ON public.visitors(status);
CREATE INDEX idx_announcements_published_at ON public.announcements(published_at);
CREATE INDEX idx_announcements_type ON public.announcements(type);
CREATE INDEX idx_announcements_district_id ON public.announcements(district_id);
CREATE INDEX idx_discussions_author_id ON public.discussions(author_id);
CREATE INDEX idx_discussions_category_id ON public.discussions(category_id);
CREATE INDEX idx_discussions_created_at ON public.discussions(created_at);
CREATE INDEX idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX idx_discussion_replies_author_id ON public.discussion_replies(author_id);
CREATE INDEX idx_marketplace_items_seller_id ON public.marketplace_items(seller_id);
CREATE INDEX idx_marketplace_items_category_id ON public.marketplace_items(category_id);
CREATE INDEX idx_marketplace_items_status ON public.marketplace_items(status);
CREATE INDEX idx_marketplace_items_created_at ON public.marketplace_items(created_at);
CREATE INDEX idx_cctv_cameras_district_id ON public.cctv_cameras(district_id);
CREATE INDEX idx_cctv_cameras_is_active ON public.cctv_cameras(is_active);
CREATE INDEX idx_sensors_district_id ON public.sensors(district_id);
CREATE INDEX idx_sensors_type ON public.sensors(type);
CREATE INDEX idx_sensors_is_active ON public.sensors(is_active);
CREATE INDEX idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_recorded_at ON public.sensor_readings(recorded_at);

-- Insert default districts
INSERT INTO public.districts (name, description) VALUES
('Taman Prima', 'Main residential area with modern facilities'),
('Taman Suria', 'Family-friendly neighborhood with parks'),
('Taman Indah', 'Premium residential area with lake view'),
('Taman Sejahtera', 'Affordable housing community'),
('Taman Harmoni', 'Mixed development with commercial areas');

-- Insert default complaint categories
INSERT INTO public.complaint_categories (name, description) VALUES
('Maintenance', 'General maintenance issues and repairs'),
('Security', 'Security-related concerns and incidents'),
('Noise', 'Noise complaints and disturbances'),
('Parking', 'Parking violations and issues'),
('Facilities', 'Issues with community facilities'),
('Cleanliness', 'Cleanliness and sanitation issues'),
('Utilities', 'Water, electricity, and other utility issues');

-- Insert default facilities
INSERT INTO public.facilities (name, description, capacity, hourly_rate, available_hours) VALUES
('Community Hall', 'Large hall for events and gatherings', 200, 50.00, '8:00 AM - 10:00 PM'),
('Tennis Court', 'Professional tennis court with equipment', 4, 20.00, '6:00 AM - 10:00 PM'),
('Swimming Pool', 'Olympic-sized swimming pool', 50, 15.00, '6:00 AM - 10:00 PM'),
('Basketball Court', 'Full-size basketball court', 10, 15.00, '6:00 AM - 10:00 PM'),
('Meeting Room A', 'Small meeting room for business use', 12, 25.00, '8:00 AM - 10:00 PM'),
('Meeting Room B', 'Medium meeting room with projector', 20, 35.00, '8:00 AM - 10:00 PM'),
('Playground', 'Children playground area', 30, 10.00, '6:00 AM - 8:00 PM');

-- Insert default discussion categories
INSERT INTO public.discussion_categories (name, description, color) VALUES
('General', 'General community discussions', '#6366f1'),
('Events', 'Community events and activities', '#10b981'),
('Safety', 'Safety and security discussions', '#f59e0b'),
('Suggestions', 'Suggestions and feedback', '#8b5cf6'),
('Buy & Sell', 'Marketplace discussions', '#06b6d4'),
('Lost & Found', 'Lost and found items', '#ef4444');

-- Insert default marketplace categories
INSERT INTO public.marketplace_categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Furniture', 'Home and office furniture'),
('Clothing', 'Clothing and accessories'),
('Books', 'Books and educational materials'),
('Sports', 'Sports equipment and gear'),
('Toys', 'Children toys and games'),
('Home & Garden', 'Home improvement and gardening items'),
('Vehicles', 'Cars, motorcycles and vehicles');

-- Insert sample CCTV cameras
INSERT INTO public.cctv_cameras (name, location, ip_address, is_active, district_id) 
SELECT 
  'Camera ' || generate_series(1, 10),
  CASE (generate_series(1, 10) % 5)
    WHEN 1 THEN 'Main Entrance'
    WHEN 2 THEN 'Parking Area'
    WHEN 3 THEN 'Playground'
    WHEN 4 THEN 'Swimming Pool'
    ELSE 'Common Area'
  END,
  ('192.168.1.' || (100 + generate_series(1, 10)))::inet,
  true,
  (SELECT id FROM public.districts ORDER BY RANDOM() LIMIT 1);

-- Insert sample sensors
INSERT INTO public.sensors (name, type, location, is_active, district_id)
SELECT 
  'Sensor ' || generate_series(1, 15),
  (ARRAY['temperature', 'humidity', 'air_quality', 'noise', 'motion']::sensor_type[])[ceil(random() * 5)],
  CASE (generate_series(1, 15) % 5)
    WHEN 1 THEN 'Community Hall'
    WHEN 2 THEN 'Swimming Pool'
    WHEN 3 THEN 'Parking Area'
    WHEN 4 THEN 'Garden Area'
    ELSE 'Common Area'
  END,
  true,
  (SELECT id FROM public.districts ORDER BY RANDOM() LIMIT 1);