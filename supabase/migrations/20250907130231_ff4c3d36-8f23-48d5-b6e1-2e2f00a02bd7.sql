-- Create complaint responses table for communication between staff and complainants
CREATE TABLE public.complaint_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL, -- Staff member who is responding
  response_text TEXT NOT NULL,
  response_type TEXT NOT NULL DEFAULT 'update', -- 'update', 'request_info', 'resolution', 'status_change'
  is_internal BOOLEAN NOT NULL DEFAULT false, -- Internal notes vs visible to complainant
  attachments TEXT[], -- URLs to attached files
  status_update TEXT, -- If this response includes a status change
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on complaint responses
ALTER TABLE public.complaint_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Staff can create responses for complaints they can manage
CREATE POLICY "Staff can create complaint responses" ON public.complaint_responses
  FOR INSERT 
  WITH CHECK (
    responder_id = auth.uid() AND 
    (
      has_enhanced_role('facility_manager'::enhanced_user_role) OR 
      has_enhanced_role('community_admin'::enhanced_user_role) OR 
      has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
      has_enhanced_role('state_admin'::enhanced_user_role) OR
      has_enhanced_role('security_officer'::enhanced_user_role) OR
      has_enhanced_role('maintenance_staff'::enhanced_user_role)
    )
  );

-- RLS Policy: Staff can view all responses for complaints they can manage
CREATE POLICY "Staff can view complaint responses" ON public.complaint_responses
  FOR SELECT 
  USING (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR 
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role) OR
    has_enhanced_role('security_officer'::enhanced_user_role) OR
    has_enhanced_role('maintenance_staff'::enhanced_user_role)
  );

-- RLS Policy: Complainants can view non-internal responses to their complaints
CREATE POLICY "Complainants can view responses to their complaints" ON public.complaint_responses
  FOR SELECT 
  USING (
    is_internal = false AND 
    EXISTS (
      SELECT 1 FROM public.complaints 
      WHERE complaints.id = complaint_responses.complaint_id 
      AND complaints.complainant_id = auth.uid()
    )
  );

-- RLS Policy: Staff can update their own responses
CREATE POLICY "Staff can update their own responses" ON public.complaint_responses
  FOR UPDATE 
  USING (
    responder_id = auth.uid() AND 
    (
      has_enhanced_role('facility_manager'::enhanced_user_role) OR 
      has_enhanced_role('community_admin'::enhanced_user_role) OR 
      has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
      has_enhanced_role('state_admin'::enhanced_user_role) OR
      has_enhanced_role('security_officer'::enhanced_user_role) OR
      has_enhanced_role('maintenance_staff'::enhanced_user_role)
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_complaint_response_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_complaint_response_updated_at
  BEFORE UPDATE ON public.complaint_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_complaint_response_timestamp();

-- Add index for better performance
CREATE INDEX idx_complaint_responses_complaint_id ON public.complaint_responses(complaint_id);
CREATE INDEX idx_complaint_responses_created_at ON public.complaint_responses(created_at DESC);

-- Create notification trigger for complaint responses
CREATE OR REPLACE FUNCTION public.notify_complaint_response()
RETURNS TRIGGER AS $$
DECLARE
  complainant_id UUID;
  complaint_title TEXT;
  responder_name TEXT;
BEGIN
  -- Get complainant and complaint details
  SELECT c.complainant_id, c.title INTO complainant_id, complaint_title
  FROM public.complaints c
  WHERE c.id = NEW.complaint_id;
  
  -- Get responder name
  SELECT COALESCE(p.full_name, p.email, 'Staff Member') INTO responder_name
  FROM public.profiles p
  WHERE p.id = NEW.responder_id;
  
  -- Only notify complainant if response is not internal
  IF NOT NEW.is_internal THEN
    INSERT INTO public.notifications (
      recipient_id,
      title,
      message,
      notification_type,
      category,
      reference_id,
      reference_table,
      created_by,
      sent_at
    ) VALUES (
      complainant_id,
      'New Response to Your Complaint',
      CONCAT(responder_name, ' responded to your complaint "', complaint_title, '"'),
      'complaint_response',
      'complaint',
      NEW.complaint_id,
      'complaints',
      NEW.responder_id,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_complaint_response_trigger
  AFTER INSERT ON public.complaint_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_complaint_response();