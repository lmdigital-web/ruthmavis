DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);

-- Grant Access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Policies (Admin only for writes, Auth only for reads)
CREATE POLICY "Admins can manage store settings"
ON public.store_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authenticated users can read store settings"
ON public.store_settings
FOR SELECT
TO authenticated
USING (true);

-- Initial Data
INSERT INTO public.store_settings (key, value) VALUES
('general', '{"contact_email": "Ruth.mavis0803@gmail.com", "notification_email": "Ruth.mavis0803@gmail.com", "store_name": "Ruth Mavis Accessories"}'::jsonb),
('payment', '{"currency": "ZAR", "tax_rate": 15, "paystack_enabled": true}'::jsonb),
('shipping', '{"free_shipping_threshold": 1000}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Grant permissions to shipping_rates (making sure admin can manage)
GRANT ALL ON public.shipping_rates TO authenticated;
