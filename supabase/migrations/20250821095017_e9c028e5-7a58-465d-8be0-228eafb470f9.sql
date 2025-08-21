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
  business_references JSONB
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