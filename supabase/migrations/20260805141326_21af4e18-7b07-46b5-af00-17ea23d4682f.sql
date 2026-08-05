CREATE TABLE public.shipping_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    region text NOT NULL,
    price decimal(10, 2) NOT NULL,
    free_shipping_threshold decimal(10, 2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Basic grants
GRANT SELECT ON public.shipping_rates TO authenticated;
GRANT SELECT ON public.shipping_rates TO anon;
GRANT ALL ON public.shipping_rates TO service_role;

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to shipping rates" ON public.shipping_rates
    FOR SELECT USING (true);

-- Seed shipping rates for South Africa
INSERT INTO public.shipping_rates (region, price, free_shipping_threshold)
VALUES 
('Gauteng', 80.00, 1000.00),
('Western Cape', 120.00, 1500.00),
('Mpumalanga', 70.00, 1000.00),
('Other Provinces', 150.00, 2000.00);

-- Update orders table to include shipping and tax
ALTER TABLE public.orders 
ADD COLUMN shipping_amount decimal(10, 2) DEFAULT 0,
ADD COLUMN tax_amount decimal(10, 2) DEFAULT 0;