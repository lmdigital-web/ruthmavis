
    CREATE TABLE IF NOT EXISTS public.product_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    GRANT SELECT ON public.product_images TO anon, authenticated;
    GRANT ALL ON public.product_images TO service_role;

    ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

    DO $$ 
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'Anyone can view product images') THEN
            CREATE POLICY "Anyone can view product images" ON public.product_images
                FOR SELECT TO anon, authenticated USING (true);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'Admins can manage product images') THEN
            CREATE POLICY "Admins can manage product images" ON public.product_images
                FOR ALL TO authenticated USING (
                    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
                );
        END IF;
    END $$;
    