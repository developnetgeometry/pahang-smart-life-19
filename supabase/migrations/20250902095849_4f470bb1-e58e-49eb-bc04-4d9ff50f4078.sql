-- Create storage buckets for different types of images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('marketplace-images', 'marketplace-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('facility-images', 'facility-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('user-avatars', 'user-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('community-assets', 'community-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for marketplace images
CREATE POLICY "Anyone can view marketplace images" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace-images');
CREATE POLICY "Authenticated users can upload marketplace images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'marketplace-images' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Users can update their own marketplace images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete their own marketplace images" ON storage.objects FOR DELETE USING (
  bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for facility images  
CREATE POLICY "Anyone can view facility images" ON storage.objects FOR SELECT USING (bucket_id = 'facility-images');
CREATE POLICY "Facility managers can upload facility images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'facility-images' AND (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR 
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  )
);
CREATE POLICY "Facility managers can update facility images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'facility-images' AND (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR 
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  )
);
CREATE POLICY "Facility managers can delete facility images" ON storage.objects FOR DELETE USING (
  bucket_id = 'facility-images' AND (
    has_enhanced_role('facility_manager'::enhanced_user_role) OR 
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  )
);

-- Create RLS policies for user avatars
CREATE POLICY "Anyone can view user avatars" ON storage.objects FOR SELECT USING (bucket_id = 'user-avatars');
CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING (
  bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING (
  bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for community assets
CREATE POLICY "Anyone can view community assets" ON storage.objects FOR SELECT USING (bucket_id = 'community-assets');
CREATE POLICY "Admins can manage community assets" ON storage.objects FOR ALL USING (
  bucket_id = 'community-assets' AND (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  )
);

-- Create image management table to track uploaded images
CREATE TABLE IF NOT EXISTS image_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  asset_type TEXT NOT NULL, -- 'marketplace', 'facility', 'avatar', 'community'
  reference_id UUID, -- Reference to related entity (facility_id, marketplace_item_id, etc.)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on image_assets table
ALTER TABLE image_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for image_assets
CREATE POLICY "Anyone can view active image assets" ON image_assets FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create image assets" ON image_assets FOR INSERT WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Users can update their own image assets" ON image_assets FOR UPDATE USING (uploaded_by = auth.uid());
CREATE POLICY "Admins can manage all image assets" ON image_assets FOR ALL USING (
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Create function to get image URL
CREATE OR REPLACE FUNCTION public.get_image_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT CONCAT('https://hjhalygcsdolryngmlry.supabase.co/storage/v1/object/public/', bucket_name, '/', file_path);
$$;

-- Create updated_at trigger for image_assets
CREATE TRIGGER update_image_assets_updated_at 
  BEFORE UPDATE ON image_assets 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();