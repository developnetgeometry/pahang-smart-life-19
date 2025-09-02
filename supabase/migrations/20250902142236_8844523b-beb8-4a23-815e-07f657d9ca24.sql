-- Create announcement polls table
CREATE TABLE IF NOT EXISTS public.announcement_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL,
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
  poll_id UUID NOT NULL,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  option_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, option_id, user_id)
);

-- Create facility buffer times table
CREATE TABLE IF NOT EXISTS public.facility_buffer_times (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL,
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
  booking_id_1 UUID NOT NULL,
  booking_id_2 UUID NOT NULL,
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
  booking_id UUID NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'booking_upcoming',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_method TEXT NOT NULL DEFAULT 'in_app',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.announcement_polls 
ADD CONSTRAINT fk_announcement_polls_announcement 
FOREIGN KEY (announcement_id) REFERENCES public.announcements(id) ON DELETE CASCADE;

ALTER TABLE public.poll_options 
ADD CONSTRAINT fk_poll_options_poll 
FOREIGN KEY (poll_id) REFERENCES public.announcement_polls(id) ON DELETE CASCADE;

ALTER TABLE public.poll_votes 
ADD CONSTRAINT fk_poll_votes_poll 
FOREIGN KEY (poll_id) REFERENCES public.announcement_polls(id) ON DELETE CASCADE;

ALTER TABLE public.poll_votes 
ADD CONSTRAINT fk_poll_votes_option 
FOREIGN KEY (option_id) REFERENCES public.poll_options(id) ON DELETE CASCADE;

ALTER TABLE public.facility_buffer_times 
ADD CONSTRAINT fk_facility_buffer_times_facility 
FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;

ALTER TABLE public.booking_conflicts 
ADD CONSTRAINT fk_booking_conflicts_booking1 
FOREIGN KEY (booking_id_1) REFERENCES public.bookings(id) ON DELETE CASCADE;

ALTER TABLE public.booking_conflicts 
ADD CONSTRAINT fk_booking_conflicts_booking2 
FOREIGN KEY (booking_id_2) REFERENCES public.bookings(id) ON DELETE CASCADE;

ALTER TABLE public.booking_reminders 
ADD CONSTRAINT fk_booking_reminders_booking 
FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

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
CREATE INDEX idx_announcement_polls_announcement_id ON public.announcement_polls(announcement_id);
CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX idx_facility_buffer_times_facility_id ON public.facility_buffer_times(facility_id);
CREATE INDEX idx_booking_conflicts_booking_ids ON public.booking_conflicts(booking_id_1, booking_id_2);
CREATE INDEX idx_booking_reminders_booking_id ON public.booking_reminders(booking_id);
CREATE INDEX idx_booking_reminders_scheduled_for ON public.booking_reminders(scheduled_for);

-- Create function to update poll vote counts
CREATE OR REPLACE FUNCTION update_poll_option_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poll_options 
    SET vote_count = vote_count + 1 
    WHERE id = NEW.option_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poll_options 
    SET vote_count = GREATEST(0, vote_count - 1) 
    WHERE id = OLD.option_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update vote counts
CREATE TRIGGER trigger_update_poll_vote_count
  AFTER INSERT OR DELETE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION update_poll_option_vote_count();

-- Create function to check for booking conflicts
CREATE OR REPLACE FUNCTION detect_booking_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_booking_id UUID;
  buffer_before INTEGER := 0;
  buffer_after INTEGER := 0;
BEGIN
  -- Get buffer times for the facility
  SELECT 
    COALESCE(buffer_before_minutes, 0),
    COALESCE(buffer_after_minutes, 0)
  INTO buffer_before, buffer_after
  FROM public.facility_buffer_times 
  WHERE facility_id = NEW.facility_id AND is_active = true;

  -- Check for conflicts with existing bookings
  SELECT b.id INTO conflict_booking_id
  FROM public.bookings b
  WHERE b.facility_id = NEW.facility_id
    AND b.id != NEW.id
    AND b.booking_date = NEW.booking_date
    AND b.status != 'cancelled'
    AND (
      -- Check if times overlap considering buffer times
      (NEW.start_time - (buffer_before || ' minutes')::INTERVAL) < (b.end_time + (buffer_after || ' minutes')::INTERVAL)
      AND (NEW.end_time + (buffer_after || ' minutes')::INTERVAL) > (b.start_time - (buffer_before || ' minutes')::INTERVAL)
    )
  LIMIT 1;

  -- Insert conflict record if found
  IF conflict_booking_id IS NOT NULL THEN
    INSERT INTO public.booking_conflicts (
      booking_id_1, 
      booking_id_2, 
      conflict_type, 
      severity
    ) VALUES (
      NEW.id, 
      conflict_booking_id, 
      'overlap', 
      'high'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for conflict detection
CREATE TRIGGER trigger_detect_booking_conflicts
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION detect_booking_conflicts();

-- Create function to schedule booking reminders
CREATE OR REPLACE FUNCTION schedule_booking_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule 24-hour reminder
  INSERT INTO public.booking_reminders (
    booking_id,
    reminder_type,
    scheduled_for,
    notification_method
  ) VALUES (
    NEW.id,
    'booking_upcoming_24h',
    (NEW.booking_date || ' ' || NEW.start_time)::TIMESTAMP - INTERVAL '24 hours',
    'in_app'
  );

  -- Schedule 2-hour reminder
  INSERT INTO public.booking_reminders (
    booking_id,
    reminder_type,
    scheduled_for,
    notification_method
  ) VALUES (
    NEW.id,
    'booking_upcoming_2h',
    (NEW.booking_date || ' ' || NEW.start_time)::TIMESTAMP - INTERVAL '2 hours',
    'in_app'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for reminder scheduling
CREATE TRIGGER trigger_schedule_booking_reminders
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION schedule_booking_reminders();