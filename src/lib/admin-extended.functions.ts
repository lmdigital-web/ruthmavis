import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getCustomers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  });

export const getStoreSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    // For now, we fetch from a settings table if it exists, or return defaults
    // Since we don't have a settings table yet, let's return from env/defaults
    return {
      paystack_public_key: process.env.VITE_PAYSTACK_PUBLIC_KEY || '',
      contact_email: 'Ruth.mavis0803@gmail.com',
      notification_email: 'Ruth.mavis0803@gmail.com',
      tax_rate: 15,
      currency: 'ZAR'
    };
  });
