-- 1. Fix: Add admin write policies for product_variants
CREATE POLICY "Admins can manage product variants"
ON public.product_variants
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2. Fix: Restrict shipping_rates to authenticated users
DROP POLICY IF EXISTS "Public can view shipping rates" ON public.shipping_rates;
DROP POLICY IF EXISTS "Allow public read" ON public.shipping_rates;

-- Re-create select policy for authenticated users only
CREATE POLICY "Authenticated users can view shipping rates"
ON public.shipping_rates
FOR SELECT
TO authenticated
USING (true);

-- Ensure admins can manage shipping rates
CREATE POLICY "Admins can manage shipping rates"
ON public.shipping_rates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Update grants: remove public read, keep authenticated/service_role
REVOKE SELECT ON public.shipping_rates FROM anon;
GRANT SELECT ON public.shipping_rates TO authenticated;
GRANT ALL ON public.shipping_rates TO service_role;
