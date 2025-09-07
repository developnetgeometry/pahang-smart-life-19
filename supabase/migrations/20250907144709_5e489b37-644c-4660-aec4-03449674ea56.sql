-- Create the public storage bucket for announcements
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the public bucket
CREATE POLICY "Allow public read access to public bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

CREATE POLICY "Allow authenticated users to upload to public bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own files in public bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'public' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own files in public bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'public' AND auth.uid()::text = (storage.foldername(name))[1]);