-- Create service provider management tables

-- Service provider applications table
CREATE TABLE service_provider_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  
  -- Business Information
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  business_description TEXT,
  business_registration_number TEXT,
  tax_id TEXT,
  
  -- Contact Information
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  business_address TEXT NOT NULL,
  
  -- Services and Operations
  services_offered TEXT[] DEFAULT ARRAY[]::TEXT[],
  service_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  operating_hours JSONB,
  service_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Application Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'additional_info_required')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Review Information  
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional Info
  website_url TEXT,
  social_media JSONB,
  insurance_info JSONB,
  experience_years INTEGER,
  references JSONB
);

-- Application documents table
CREATE TABLE application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES service_provider_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date DATE,
  notes TEXT
);

-- Service provider profiles (for approved providers)
CREATE TABLE service_provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  application_id UUID REFERENCES service_provider_applications(id),
  district_id UUID REFERENCES districts(id),
  
  -- Business Details
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  business_description TEXT,
  logo_url TEXT,
  
  -- Service Information
  services_offered TEXT[] DEFAULT ARRAY[]::TEXT[],
  service_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  service_pricing JSONB,
  operating_hours JSONB,
  
  -- Contact & Location
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  business_address TEXT,
  service_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Online Presence
  website_url TEXT,
  social_media JSONB,
  
  -- Ratings & Reviews
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Status & Compliance
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  compliance_status TEXT DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'warning', 'suspended')),
  
  -- Timestamps
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional
  featured BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise'))
);

-- Application communication log
CREATE TABLE application_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES service_provider_applications(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  message_type TEXT DEFAULT 'note' CHECK (message_type IN ('note', 'request', 'response', 'system')),
  subject TEXT,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_by UUID[] DEFAULT ARRAY[]::UUID[]
);

-- Enable RLS on all tables
ALTER TABLE service_provider_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_provider_applications
CREATE POLICY "Community admins can manage all applications"
  ON service_provider_applications FOR ALL
  USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

CREATE POLICY "Users can create their own applications"
  ON service_provider_applications FOR INSERT
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Users can view their own applications"
  ON service_provider_applications FOR SELECT
  USING (applicant_id = auth.uid());

CREATE POLICY "Users can update their own pending applications"
  ON service_provider_applications FOR UPDATE
  USING (applicant_id = auth.uid() AND status IN ('pending', 'additional_info_required'));

-- RLS Policies for application_documents
CREATE POLICY "Community admins can manage all documents"
  ON application_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM service_provider_applications spa
    WHERE spa.id = application_documents.application_id
    AND (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'))
  ));

CREATE POLICY "Users can manage their own application documents"
  ON application_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM service_provider_applications spa
    WHERE spa.id = application_documents.application_id
    AND spa.applicant_id = auth.uid()
  ));

-- RLS Policies for service_provider_profiles
CREATE POLICY "Everyone can view active provider profiles"
  ON service_provider_profiles FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Providers can update their own profiles"
  ON service_provider_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Community admins can manage provider profiles"
  ON service_provider_profiles FOR ALL
  USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

-- RLS Policies for application_communications
CREATE POLICY "Community admins can manage all communications"
  ON application_communications FOR ALL
  USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

CREATE POLICY "Users can view communications for their applications"
  ON application_communications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM service_provider_applications spa
    WHERE spa.id = application_communications.application_id
    AND spa.applicant_id = auth.uid()
  ));

CREATE POLICY "Users can respond to communications for their applications"
  ON application_communications FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM service_provider_applications spa
    WHERE spa.id = application_communications.application_id
    AND spa.applicant_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_applications_status ON service_provider_applications(status);
CREATE INDEX idx_applications_district ON service_provider_applications(district_id);
CREATE INDEX idx_applications_applicant ON service_provider_applications(applicant_id);
CREATE INDEX idx_documents_application ON application_documents(application_id);
CREATE INDEX idx_profiles_user ON service_provider_profiles(user_id);
CREATE INDEX idx_profiles_district ON service_provider_profiles(district_id);
CREATE INDEX idx_communications_application ON application_communications(application_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_service_provider_applications_updated_at
  BEFORE UPDATE ON service_provider_applications
  FOR EACH ROW EXECUTE FUNCTION update_application_updated_at();

CREATE TRIGGER update_service_provider_profiles_updated_at
  BEFORE UPDATE ON service_provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_application_updated_at();