
-- RLS policies for customer-uploads bucket
-- Allow authenticated users to upload files to their own folders
CREATE POLICY "Authenticated users can upload to customer-uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customer-uploads' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- Allow authenticated users to view their own uploads
CREATE POLICY "Authenticated users can view their uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'customer-uploads' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- Allow service_role (admin) full access
CREATE POLICY "Service role can manage customer uploads"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'customer-uploads')
WITH CHECK (bucket_id = 'customer-uploads');
