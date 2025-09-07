-- Create facility images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-images', 'facility-images', true)
ON CONFLICT (id) DO NOTHING;