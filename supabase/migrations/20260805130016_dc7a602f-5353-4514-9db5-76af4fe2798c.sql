-- 1. Fix SECURITY DEFINER function search path and permissions (Linter issues)
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Revoke execute from public/authenticated to satisfy security linter
-- The trigger itself runs with the owner's privileges (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- 2. Storage policies for the bucket (already created via tool)
-- Allow public read (effectively making it public)
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Allow admins to upload/manage
CREATE POLICY "Admins can manage product images" ON storage.objects FOR ALL TO authenticated 
USING (
    bucket_id = 'product-images' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    bucket_id = 'product-images' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
