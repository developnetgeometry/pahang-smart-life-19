-- Create storage bucket for service provider documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-provider-documents', 'service-provider-documents', false);

-- Create RLS policies for service provider documents
CREATE POLICY "Service providers can upload their documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-provider-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Service providers can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'service-provider-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all service provider documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'service-provider-documents' 
  AND (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  )
);

CREATE POLICY "Service providers can update their documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'service-provider-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Service providers can delete their documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-provider-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);