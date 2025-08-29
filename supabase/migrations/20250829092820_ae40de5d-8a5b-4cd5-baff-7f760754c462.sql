-- Create storage bucket for complaint photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('complaint-photos', 'complaint-photos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Create RLS policies for complaint photos bucket
CREATE POLICY "Users can upload their own complaint photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'complaint-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own complaint photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'complaint-photos' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1] 
    OR has_enhanced_role('community_admin') 
    OR has_enhanced_role('district_coordinator') 
    OR has_enhanced_role('state_admin')
  )
);

CREATE POLICY "Users can delete their own complaint photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'complaint-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Complaint photos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'complaint-photos');