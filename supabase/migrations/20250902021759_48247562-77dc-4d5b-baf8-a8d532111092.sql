-- Enhanced Facility Management System (Basic Tables First)

-- Create enhanced facilities table
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  facility_type TEXT NOT NULL DEFAULT 'common_area',
  location TEXT,
  capacity INTEGER DEFAULT 1,
  
  -- Booking configuration
  advance_booking_days INTEGER DEFAULT 30,
  max_booking_hours INTEGER DEFAULT 4,
  min_booking_hours INTEGER DEFAULT 1,
  buffer_time_minutes INTEGER DEFAULT 15,
  
  -- Operating hours
  operating_hours JSONB DEFAULT '{"monday": {"start": "08:00", "end": "22:00", "closed": false}, "tuesday": {"start": "08:00", "end": "22:00", "closed": false}, "wednesday": {"start": "08:00", "end": "22:00", "closed": false}, "thursday": {"start": "08:00", "end": "22:00", "closed": false}, "friday": {"start": "08:00", "end": "22:00", "closed": false}, "saturday": {"start": "08:00", "end": "22:00", "closed": false}, "sunday": {"start": "08:00", "end": "22:00", "closed": false}}',
  
  -- Pricing and rules
  hourly_rate NUMERIC DEFAULT 0,
  requires_approval BOOLEAN DEFAULT false,
  auto_approve_hours INTEGER DEFAULT 2,
  
  -- Status and availability
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_notes TEXT,
  
  -- Metadata
  features JSONB DEFAULT '[]',
  rules JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  
  -- Administrative
  district_id UUID,
  managed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS public.facility_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  equipment_type TEXT NOT NULL,
  
  -- Availability
  quantity_available INTEGER DEFAULT 1,
  is_bookable BOOLEAN DEFAULT true,
  requires_training BOOLEAN DEFAULT false,
  
  -- Condition tracking
  condition_status TEXT DEFAULT 'good',
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_notes TEXT,
  
  -- Administrative
  purchase_date DATE,
  warranty_expiry DATE,
  serial_number TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create booking equipment junction table
CREATE TABLE IF NOT EXISTS public.booking_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.facility_equipment(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(booking_id, equipment_id)
);

-- Create facility usage tracking
CREATE TABLE IF NOT EXISTS public.facility_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID,
  
  -- Usage details
  usage_type TEXT DEFAULT 'booking', -- booking, maintenance, event, etc.
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  attendee_count INTEGER,
  
  -- Feedback and notes
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  staff_notes TEXT,
  
  -- Issues and incidents
  issues_reported JSONB DEFAULT '[]',
  damage_reported BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create facility availability calendar
CREATE TABLE IF NOT EXISTS public.facility_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  
  -- Date and time specific availability
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  
  -- Override operating hours for specific dates
  custom_hours JSONB, -- {"start": "09:00", "end": "18:00"} or {"closed": true}
  
  -- Special pricing or rules
  special_rate NUMERIC,
  special_rules JSONB DEFAULT '[]',
  
  -- Reason for availability change
  reason TEXT,
  notes TEXT,
  
  -- Administrative
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Unique constraint to prevent overlapping availability
  UNIQUE(facility_id, date_from, date_to)
);

-- Create booking reminders table
CREATE TABLE IF NOT EXISTS public.booking_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  
  -- Reminder configuration
  reminder_type TEXT NOT NULL, -- 'advance', 'start', 'end', 'cleanup'
  minutes_before INTEGER NOT NULL,
  
  -- Delivery status
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_method TEXT DEFAULT 'in_app', -- in_app, email, sms, push
  
  -- Message content
  title TEXT,
  message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_facilities_district_active ON public.facilities(district_id, is_active);
CREATE INDEX IF NOT EXISTS idx_facilities_type_available ON public.facilities(facility_type, is_available);
CREATE INDEX IF NOT EXISTS idx_booking_equipment_booking ON public.booking_equipment(booking_id);
CREATE INDEX IF NOT EXISTS idx_facility_usage_facility_date ON public.facility_usage_logs(facility_id, created_at);
CREATE INDEX IF NOT EXISTS idx_facility_availability_facility_date ON public.facility_availability(facility_id, date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking ON public.booking_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_unsent ON public.booking_reminders(sent_at) WHERE sent_at IS NULL;

-- Enable RLS
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for facilities
CREATE POLICY "Everyone can view active facilities in their district" ON public.facilities
  FOR SELECT USING (is_active = true AND district_id = get_user_district());

CREATE POLICY "Facility managers can manage facilities" ON public.facilities
  FOR ALL USING (
    has_enhanced_role('facility_manager') OR 
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin') OR
    managed_by = auth.uid()
  );

-- RLS Policies for equipment
CREATE POLICY "Users can view equipment for available facilities" ON public.facility_equipment
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.facilities f 
      WHERE f.id = facility_equipment.facility_id 
      AND f.is_active = true 
      AND f.district_id = get_user_district()
    )
  );

CREATE POLICY "Facility managers can manage equipment" ON public.facility_equipment
  FOR ALL USING (
    has_enhanced_role('facility_manager') OR 
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
  );

-- RLS Policies for booking equipment
CREATE POLICY "Users can manage their booking equipment" ON public.booking_equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_equipment.booking_id 
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all booking equipment" ON public.booking_equipment
  FOR SELECT USING (
    has_enhanced_role('facility_manager') OR 
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
  );

-- RLS Policies for usage logs
CREATE POLICY "Users can view their own usage logs" ON public.facility_usage_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all usage logs in their district" ON public.facility_usage_logs
  FOR ALL USING (
    has_enhanced_role('facility_manager') OR 
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
  );

CREATE POLICY "Users can create their own usage logs" ON public.facility_usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for availability
CREATE POLICY "Users can view facility availability" ON public.facility_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.facilities f 
      WHERE f.id = facility_availability.facility_id 
      AND f.district_id = get_user_district()
    )
  );

CREATE POLICY "Facility managers can manage availability" ON public.facility_availability
  FOR ALL USING (
    has_enhanced_role('facility_manager') OR 
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
  );

-- RLS Policies for reminders
CREATE POLICY "Users can view their booking reminders" ON public.booking_reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_reminders.booking_id 
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage all reminders" ON public.booking_reminders
  FOR ALL USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_equipment_updated_at
  BEFORE UPDATE ON facility_equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();