-- Create function to update poll vote counts
CREATE OR REPLACE FUNCTION update_poll_option_vote_count()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create trigger to update vote counts
CREATE TRIGGER trigger_update_poll_vote_count
  AFTER INSERT OR DELETE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION update_poll_option_vote_count();

-- Create function to check for booking conflicts
CREATE OR REPLACE FUNCTION detect_booking_conflicts()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create trigger for conflict detection
CREATE TRIGGER trigger_detect_booking_conflicts
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION detect_booking_conflicts();

-- Create function to schedule booking reminders
CREATE OR REPLACE FUNCTION schedule_booking_reminders()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create trigger for reminder scheduling
CREATE TRIGGER trigger_schedule_booking_reminders
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION schedule_booking_reminders();