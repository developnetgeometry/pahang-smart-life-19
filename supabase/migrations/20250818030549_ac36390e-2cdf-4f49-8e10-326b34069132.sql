-- Create custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'security', 'manager', 'resident');
CREATE TYPE public.complaint_status AS ENUM ('pending', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.visitor_status AS ENUM ('pending', 'approved', 'denied', 'checked_in', 'checked_out');
CREATE TYPE public.announcement_type AS ENUM ('general', 'maintenance', 'security', 'event', 'emergency');
CREATE TYPE public.marketplace_condition AS ENUM ('new', 'excellent', 'good', 'fair', 'poor');

-- Districts table
CREATE TABLE public.districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Malaysia',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    district_id UUID REFERENCES public.districts(id),
    unit_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    vehicle_plate_number TEXT,
    avatar_url TEXT,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'light',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.user_role NOT NULL,
    district_id UUID REFERENCES public.districts(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES public.profiles(id),
    UNIQUE(user_id, role, district_id)
);

-- Announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type public.announcement_type DEFAULT 'general',
    district_id UUID REFERENCES public.districts(id),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_urgent BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    publish_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expire_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Facilities table
CREATE TABLE public.facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    district_id UUID REFERENCES public.districts(id),
    capacity INTEGER,
    hourly_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true,
    operating_hours JSONB,
    amenities TEXT[],
    rules TEXT[],
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL,
    total_amount DECIMAL(10,2),
    status public.booking_status DEFAULT 'pending',
    purpose TEXT,
    notes TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Visitors table
CREATE TABLE public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT,
    visitor_ic TEXT,
    vehicle_plate TEXT,
    visit_date DATE NOT NULL,
    visit_time TIME,
    purpose TEXT,
    status public.visitor_status DEFAULT 'pending',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Complaints table
CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority public.complaint_priority DEFAULT 'medium',
    status public.complaint_status DEFAULT 'pending',
    location TEXT,
    district_id UUID REFERENCES public.districts(id),
    complainant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id),
    resolution TEXT,
    photos TEXT[],
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CCTV Cameras table
CREATE TABLE public.cctv_cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    district_id UUID REFERENCES public.districts(id),
    stream_url TEXT,
    is_active BOOLEAN DEFAULT true,
    camera_type TEXT,
    resolution TEXT,
    night_vision BOOLEAN DEFAULT false,
    pan_tilt_zoom BOOLEAN DEFAULT false,
    recording_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace listings table
CREATE TABLE public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    condition public.marketplace_condition DEFAULT 'good',
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    district_id UUID REFERENCES public.districts(id),
    images TEXT[],
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Discussions/Forum table
CREATE TABLE public.discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    district_id UUID REFERENCES public.districts(id),
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Discussion replies table
CREATE TABLE public.discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES public.discussion_replies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sensors table
CREATE TABLE public.sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    district_id UUID REFERENCES public.districts(id),
    is_active BOOLEAN DEFAULT true,
    unit TEXT,
    min_threshold DECIMAL(10,2),
    max_threshold DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sensor readings table
CREATE TABLE public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES public.sensors(id) ON DELETE CASCADE,
    value DECIMAL(10,4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_alert BOOLEAN DEFAULT false
);

-- Maintenance requests table
CREATE TABLE public.maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority public.complaint_priority DEFAULT 'medium',
    status public.complaint_status DEFAULT 'pending',
    location TEXT,
    district_id UUID REFERENCES public.districts(id),
    requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cctv_cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID, district_id UUID DEFAULT NULL)
RETURNS public.user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_roles.user_id = get_user_role.user_id 
  AND (district_id IS NULL OR user_roles.district_id = get_user_role.district_id)
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'security' THEN 3
      WHEN 'resident' THEN 4
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(check_role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = check_role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_district()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT district_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role('admin'));

-- Districts policies
CREATE POLICY "Everyone can view districts" ON public.districts
FOR SELECT USING (true);

CREATE POLICY "Admins can manage districts" ON public.districts
FOR ALL USING (public.has_role('admin'));

-- User roles policies
CREATE POLICY "Users can view roles in their district" ON public.user_roles
FOR SELECT USING (
  district_id = public.get_user_district() OR 
  public.has_role('admin')
);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role('admin'));

-- Announcements policies
CREATE POLICY "Users can view announcements in their district" ON public.announcements
FOR SELECT USING (
  district_id = public.get_user_district() AND 
  (is_published = true AND (publish_at <= now() AND (expire_at IS NULL OR expire_at > now())))
);

CREATE POLICY "Managers can create announcements" ON public.announcements
FOR INSERT WITH CHECK (
  public.has_role('manager') OR public.has_role('admin')
);

CREATE POLICY "Authors can update their announcements" ON public.announcements
FOR UPDATE USING (
  author_id = auth.uid() OR public.has_role('admin')
);

-- Facilities policies
CREATE POLICY "Users can view facilities in their district" ON public.facilities
FOR SELECT USING (district_id = public.get_user_district());

CREATE POLICY "Managers can manage facilities" ON public.facilities
FOR ALL USING (public.has_role('manager') OR public.has_role('admin'));

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON public.bookings
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON public.bookings
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Managers can view all bookings in their district" ON public.bookings
FOR SELECT USING (
  public.has_role('manager') OR public.has_role('admin')
);

-- Visitors policies
CREATE POLICY "Users can manage their own visitors" ON public.visitors
FOR ALL USING (host_id = auth.uid());

CREATE POLICY "Security can view all visitors" ON public.visitors
FOR SELECT USING (
  public.has_role('security') OR public.has_role('admin')
);

CREATE POLICY "Security can update visitor status" ON public.visitors
FOR UPDATE USING (
  public.has_role('security') OR public.has_role('admin')
);

-- Complaints policies
CREATE POLICY "Users can view their own complaints" ON public.complaints
FOR SELECT USING (complainant_id = auth.uid());

CREATE POLICY "Users can create complaints" ON public.complaints
FOR INSERT WITH CHECK (complainant_id = auth.uid());

CREATE POLICY "Managers can view all complaints in their district" ON public.complaints
FOR SELECT USING (
  public.has_role('manager') OR public.has_role('admin')
);

CREATE POLICY "Managers can update complaints" ON public.complaints
FOR UPDATE USING (
  public.has_role('manager') OR public.has_role('admin')
);

-- CCTV cameras policies
CREATE POLICY "Residents can view cameras in their district" ON public.cctv_cameras
FOR SELECT USING (district_id = public.get_user_district());

CREATE POLICY "Security can manage cameras" ON public.cctv_cameras
FOR ALL USING (
  public.has_role('security') OR public.has_role('admin')
);

-- Marketplace policies
CREATE POLICY "Users can view listings in their district" ON public.marketplace_listings
FOR SELECT USING (district_id = public.get_user_district());

CREATE POLICY "Users can create their own listings" ON public.marketplace_listings
FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
FOR UPDATE USING (seller_id = auth.uid());

-- Discussions policies
CREATE POLICY "Users can view discussions in their district" ON public.discussions
FOR SELECT USING (district_id = public.get_user_district());

CREATE POLICY "Users can create discussions" ON public.discussions
FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their discussions" ON public.discussions
FOR UPDATE USING (author_id = auth.uid());

-- Discussion replies policies
CREATE POLICY "Users can view replies" ON public.discussion_replies
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.discussions d 
    WHERE d.id = discussion_id AND d.district_id = public.get_user_district()
  )
);

CREATE POLICY "Users can create replies" ON public.discussion_replies
FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their replies" ON public.discussion_replies
FOR UPDATE USING (author_id = auth.uid());

-- Sensors policies
CREATE POLICY "Users can view sensors in their district" ON public.sensors
FOR SELECT USING (district_id = public.get_user_district());

CREATE POLICY "Managers can manage sensors" ON public.sensors
FOR ALL USING (public.has_role('manager') OR public.has_role('admin'));

-- Sensor readings policies
CREATE POLICY "Users can view sensor readings" ON public.sensor_readings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sensors s 
    WHERE s.id = sensor_id AND s.district_id = public.get_user_district()
  )
);

CREATE POLICY "System can insert sensor readings" ON public.sensor_readings
FOR INSERT WITH CHECK (true);

-- Maintenance requests policies
CREATE POLICY "Users can view their own maintenance requests" ON public.maintenance_requests
FOR SELECT USING (requested_by = auth.uid());

CREATE POLICY "Users can create maintenance requests" ON public.maintenance_requests
FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Managers can view all maintenance requests" ON public.maintenance_requests
FOR SELECT USING (
  public.has_role('manager') OR public.has_role('admin')
);

CREATE POLICY "Managers can update maintenance requests" ON public.maintenance_requests
FOR UPDATE USING (
  public.has_role('manager') OR public.has_role('admin')
);

-- Automatic profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables with updated_at
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON public.districts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON public.visitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cctv_cameras_updated_at BEFORE UPDATE ON public.cctv_cameras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON public.discussions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON public.discussion_replies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON public.sensors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_district_id ON public.profiles(district_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_district_id ON public.user_roles(district_id);
CREATE INDEX idx_announcements_district_id ON public.announcements(district_id);
CREATE INDEX idx_announcements_publish_at ON public.announcements(publish_at);
CREATE INDEX idx_facilities_district_id ON public.facilities(district_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_facility_id ON public.bookings(facility_id);
CREATE INDEX idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX idx_visitors_host_id ON public.visitors(host_id);
CREATE INDEX idx_visitors_visit_date ON public.visitors(visit_date);
CREATE INDEX idx_complaints_complainant_id ON public.complaints(complainant_id);
CREATE INDEX idx_complaints_district_id ON public.complaints(district_id);
CREATE INDEX idx_cctv_cameras_district_id ON public.cctv_cameras(district_id);
CREATE INDEX idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_district_id ON public.marketplace_listings(district_id);
CREATE INDEX idx_discussions_district_id ON public.discussions(district_id);
CREATE INDEX idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX idx_sensors_district_id ON public.sensors(district_id);
CREATE INDEX idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON public.sensor_readings(timestamp);
CREATE INDEX idx_maintenance_requests_district_id ON public.maintenance_requests(district_id);

-- Insert sample districts
INSERT INTO public.districts (name, description, address, city, state) VALUES
('Pahang Prima North', 'Northern district of Pahang Prima community', 'Jalan Prima Utara', 'Kuantan', 'Pahang'),
('Pahang Prima South', 'Southern district of Pahang Prima community', 'Jalan Prima Selatan', 'Kuantan', 'Pahang'),
('Pahang Prima East', 'Eastern district of Pahang Prima community', 'Jalan Prima Timur', 'Kuantan', 'Pahang'),
('Pahang Prima West', 'Western district of Pahang Prima community', 'Jalan Prima Barat', 'Kuantan', 'Pahang');