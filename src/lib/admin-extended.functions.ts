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
    const { data, error } = await supabase
      .from('store_settings')
      .select('*');
    
    if (error) {
      console.error("Error fetching settings:", error);
      // Fallback to defaults if table not ready or error
      return {
        general: { contact_email: 'Ruth.mavis0803@gmail.com', notification_email: 'Ruth.mavis0803@gmail.com', store_name: 'Ruth Mavis Accessories' },
        payment: { currency: 'ZAR', tax_rate: 15, paystack_enabled: true },
        shipping: { free_shipping_threshold: 1000 }
      };
    }

    // Convert array to object
    const settings: Record<string, any> = {};
    data?.forEach(item => {
      settings[item.key] = item.value;
    });
    
    return settings;
  });

export const updateStoreSettings = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    key: z.string(),
    value: z.any()
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() });
    
    if (error) throw error;
    return { success: true };
  });

export const updateShippingRate = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    id: z.string().optional(),
    region: z.string(),
    price: z.number(),
    free_shipping_threshold: z.number().nullable()
  }).parse(data))
  .handler(async ({ data }) => {
    if (data.id) {
      const { error } = await supabase
        .from('shipping_rates')
        .update({
          region: data.region,
          price: data.price,
          free_shipping_threshold: data.free_shipping_threshold,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('shipping_rates')
        .insert({
          region: data.region,
          price: data.price,
          free_shipping_threshold: data.free_shipping_threshold
        });
      if (error) throw error;
    }
    return { success: true };
  });

export const deleteShippingRate = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from('shipping_rates')
      .delete()
      .eq('id', data.id);
    if (error) throw error;
    return { success: true };
  });
