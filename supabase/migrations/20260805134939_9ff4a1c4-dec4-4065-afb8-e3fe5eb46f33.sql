
-- Create product_variants table
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  size TEXT,
  color TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grant access to authenticated and service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all variants
CREATE POLICY "Authenticated users can read variants"
ON public.product_variants
FOR SELECT
TO authenticated
USING (TRUE);

-- Policy: Allow service_role (admin) to manage variants
CREATE POLICY "Service role can manage variants"
ON public.product_variants
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);
