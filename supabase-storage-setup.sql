-- Run in Supabase SQL Editor
-- Creates the 'outputs' storage bucket (if not exists) and sets up access policies

-- 1. Create the bucket (public, so output URLs are directly accessible)
INSERT INTO storage.buckets (id, name, public)
VALUES ('outputs', 'outputs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload files
CREATE POLICY "Auth users can upload outputs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'outputs');

-- 3. Allow anyone to read (public bucket)
CREATE POLICY "Public read outputs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'outputs');

-- 4. Allow users to delete their own files
CREATE POLICY "Auth users can delete outputs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'outputs');
