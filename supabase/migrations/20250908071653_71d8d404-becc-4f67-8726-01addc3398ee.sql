-- Create the complaint_responses table
CREATE TABLE public.complaint_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL,
  response_text TEXT NOT NULL,
  response_type TEXT NOT NULL DEFAULT 'update'::TEXT,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  internal_comments TEXT,
  attachments TEXT[],
  status_update TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaint_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view responses to their complaints"
ON public.complaint_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM complaints 
    WHERE complaints.id = complaint_responses.complaint_id 
    AND complaints.complainant_id = auth.uid()
  )
);

CREATE POLICY "Staff can view all complaint responses"
ON public.complaint_responses
FOR SELECT
USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR
  has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR
  has_enhanced_role('state_admin'::enhanced_user_role)
);

CREATE POLICY "Staff can create complaint responses"
ON public.complaint_responses
FOR INSERT
WITH CHECK (
  (responder_id = auth.uid()) AND (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR
    has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
    has_enhanced_role('community_admin'::enhanced_user_role) OR
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR
    has_enhanced_role('state_admin'::enhanced_user_role)
  )
);

CREATE POLICY "Staff can update their own responses"
ON public.complaint_responses
FOR UPDATE
USING (
  responder_id = auth.uid() AND (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR
    has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
    has_enhanced_role('community_admin'::enhanced_user_role) OR
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR
    has_enhanced_role('state_admin'::enhanced_user_role)
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_complaint_responses_updated_at
  BEFORE UPDATE ON public.complaint_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_complaint_response_timestamp();

-- Create indexes for better performance
CREATE INDEX idx_complaint_responses_complaint_id ON public.complaint_responses(complaint_id);
CREATE INDEX idx_complaint_responses_responder_id ON public.complaint_responses(responder_id);
CREATE INDEX idx_complaint_responses_created_at ON public.complaint_responses(created_at);