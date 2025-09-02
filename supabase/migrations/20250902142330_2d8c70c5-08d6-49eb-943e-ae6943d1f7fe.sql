-- Create announcement polls table
CREATE TABLE IF NOT EXISTS public.announcement_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  allow_multiple_votes BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.announcement_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.announcement_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, option_id, user_id)
);

-- Create facility buffer times table
CREATE TABLE IF NOT EXISTS public.facility_buffer_times (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  buffer_before_minutes INTEGER NOT NULL DEFAULT 0,
  buffer_after_minutes INTEGER NOT NULL DEFAULT 0,
  cleaning_time_minutes INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(facility_id)
);

-- Create booking conflicts table
CREATE TABLE IF NOT EXISTS public.booking_conflicts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id_1 UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  booking_id_2 UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL DEFAULT 'overlap',
  severity TEXT NOT NULL DEFAULT 'medium',
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolution_notes TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Create booking reminders table
CREATE TABLE IF NOT EXISTS public.booking_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL DEFAULT 'booking_upcoming',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_method TEXT NOT NULL DEFAULT 'in_app',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.announcement_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_buffer_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcement_polls
CREATE POLICY "Users can view polls" ON public.announcement_polls 
FOR SELECT USING (true);

CREATE POLICY "Management can manage polls" ON public.announcement_polls 
FOR ALL USING (
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role) OR 
  created_by = auth.uid()
);

-- RLS Policies for poll_options
CREATE POLICY "Users can view poll options" ON public.poll_options 
FOR SELECT USING (true);

CREATE POLICY "Management can manage poll options" ON public.poll_options 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.announcement_polls p 
    WHERE p.id = poll_options.poll_id AND (
      has_enhanced_role('community_admin'::enhanced_user_role) OR 
      has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
      has_enhanced_role('state_admin'::enhanced_user_role) OR 
      p.created_by = auth.uid()
    )
  )
);

-- RLS Policies for poll_votes
CREATE POLICY "Users can view poll votes" ON public.poll_votes 
FOR SELECT USING (true);

CREATE POLICY "Users can vote on polls" ON public.poll_votes 
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own votes" ON public.poll_votes 
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own votes" ON public.poll_votes 
FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for facility_buffer_times
CREATE POLICY "Users can view buffer times" ON public.facility_buffer_times 
FOR SELECT USING (true);

CREATE POLICY "Facility managers can manage buffer times" ON public.facility_buffer_times 
FOR ALL USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- RLS Policies for booking_conflicts
CREATE POLICY "Management can view conflicts" ON public.booking_conflicts 
FOR SELECT USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

CREATE POLICY "System can manage conflicts" ON public.booking_conflicts 
FOR ALL USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- RLS Policies for booking_reminders
CREATE POLICY "Users can view their booking reminders" ON public.booking_reminders 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_reminders.booking_id AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Management can view all reminders" ON public.booking_reminders 
FOR SELECT USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

CREATE POLICY "System can manage reminders" ON public.booking_reminders 
FOR ALL USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_announcement_polls_announcement_id ON public.announcement_polls(announcement_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_facility_buffer_times_facility_id ON public.facility_buffer_times(facility_id);
CREATE INDEX IF NOT EXISTS idx_booking_conflicts_booking_ids ON public.booking_conflicts(booking_id_1, booking_id_2);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking_id ON public.booking_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_scheduled_for ON public.booking_reminders(scheduled_for);