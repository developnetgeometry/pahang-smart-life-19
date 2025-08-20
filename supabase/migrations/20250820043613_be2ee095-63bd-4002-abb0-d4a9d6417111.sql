-- Create storage bucket for role request documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('role-documents', 'role-documents', false);

-- Create RLS policies for role documents bucket
CREATE POLICY "Users can upload their own role documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'role-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own role documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'role-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all role documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'role-documents' AND 
  (has_role('admin'::user_role) OR 
   has_role('community_admin'::user_role) OR 
   has_role('district_coordinator'::user_role) OR 
   has_role('state_admin'::user_role))
);

CREATE POLICY "Users can delete their own role documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'role-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);