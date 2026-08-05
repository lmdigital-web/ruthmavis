
-- Add RLS policy to allow unauthenticated users to read product variants
CREATE POLICY "Anyone can select product variants"
ON public.product_variants
FOR SELECT
TO anon, authenticated
USING (true);
