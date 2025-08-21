-- Add RLS policies for service provider tables

-- Enable RLS on the tables
ALTER TABLE service_provider_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_communications ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_provider_applications
CREATE POLICY "Applicants can view their own applications"
ON service_provider_applications FOR SELECT
USING (applicant_id = auth.uid());

CREATE POLICY "Applicants can create their own applications"
ON service_provider_applications FOR INSERT
WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Applicants can update their own applications"
ON service_provider_applications FOR UPDATE
USING (applicant_id = auth.uid());

CREATE POLICY "Admins can manage all service provider applications"
ON service_provider_applications FOR ALL
USING (
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);

-- RLS policies for service_provider_profiles  
CREATE POLICY "Everyone can view active service providers"
ON service_provider_profiles FOR SELECT
USING (is_active = true AND is_verified = true);

CREATE POLICY "Providers can update their own profiles"
ON service_provider_profiles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all service provider profiles"
ON service_provider_profiles FOR ALL
USING (
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);

-- RLS policies for application_documents
CREATE POLICY "Applicants can view their own documents"
ON application_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM service_provider_applications 
    WHERE id = application_documents.application_id 
    AND applicant_id = auth.uid()
  )
);

CREATE POLICY "Applicants can upload documents for their applications"
ON application_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM service_provider_applications 
    WHERE id = application_documents.application_id 
    AND applicant_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all application documents"
ON application_documents FOR ALL
USING (
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);

-- RLS policies for application_communications
CREATE POLICY "Applicants can view communications for their applications"
ON application_communications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM service_provider_applications 
    WHERE id = application_communications.application_id 
    AND applicant_id = auth.uid()
  )
);

CREATE POLICY "Applicants can create communications for their applications"
ON application_communications FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM service_provider_applications 
    WHERE id = application_communications.application_id 
    AND applicant_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all application communications"
ON application_communications FOR ALL
USING (
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);