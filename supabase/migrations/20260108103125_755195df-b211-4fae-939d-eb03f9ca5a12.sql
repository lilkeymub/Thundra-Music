-- Create storage bucket for track audio and video
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tracks', 'tracks', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tracks bucket
CREATE POLICY "Anyone can view tracks"
ON storage.objects FOR SELECT
USING (bucket_id = 'tracks');

CREATE POLICY "Artists can upload tracks"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tracks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.has_role(auth.uid(), 'artist')
);

CREATE POLICY "Artists can update their tracks"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tracks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Artists can delete their tracks"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tracks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add story column to tracks table
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS story TEXT;

-- Add video_url column to tracks table
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS video_url TEXT;