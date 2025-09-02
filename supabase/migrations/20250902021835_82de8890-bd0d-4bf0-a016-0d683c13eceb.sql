-- Enhanced Facility Management System
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  facility_type TEXT NOT NULL DEFAULT 'common_area',
  location TEXT,
  capacity INTEGER DEFAULT 1,
  advance_booking_days INTEGER DEFAULT 30,
  max_booking_hours INTEGER DEFAULT 4,
  min_booking_hours INTEGER DEFAULT 1,
  buffer_time_minutes INTEGER DEFAULT 15,
  operating_hours JSONB DEFAULT '{"monday": {"start": "08:00", "end": "22:00", "closed": false}}',
  hourly_rate NUMERIC DEFAULT 0,
  requires_approval BOOLEAN DEFAULT false,
  auto_approve_hours INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_notes TEXT,
  features JSONB DEFAULT '[]',
  rules JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  district_id UUID,
  managed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

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