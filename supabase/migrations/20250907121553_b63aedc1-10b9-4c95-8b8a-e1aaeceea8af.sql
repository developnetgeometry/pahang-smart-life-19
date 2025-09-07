-- Check if facility-images bucket exists and create if needed
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-images', 'facility-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for facility images bucket
CREATE POLICY "Anyone can view facility images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'facility-images');

CREATE POLICY "Authenticated users can upload facility images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'facility-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own facility images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'facility-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own facility images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'facility-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);