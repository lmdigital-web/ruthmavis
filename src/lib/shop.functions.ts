import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getProducts = createServerFn({ method: "GET" })
  .validator((data) => z.object({ 
    category: z.string().optional(),
    search: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("is_active", true);

    if (data.category && data.category !== 'all') {
      query = query.eq("categories.slug", data.category);
    }

    if (data.search) {
      query = query.ilike("name", `%${data.search}%`);
    }

    const { data: products, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    
    // Filter out products where category slug didn't match if joined with eq filter
    // Supabase returns null for the join if it doesn't match, so we filter in JS if needed
    // Actually, eq("categories.slug", data.category) on the join table handles it if configured correctly
    return products || [];
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator((data) => z.string().parse(data))
  .handler(async ({ data: slug }) => {
    const { data: product, error } = await supabase
      .from("products")
      .select("*, categories(name, slug), product_images(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    
    // Ensure product_images is sorted by display_order
    if (product.product_images) {
      product.product_images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
    }
    
    return product;
  });

export const getCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return categories || [];
  });

export const getProductVariants = createServerFn({ method: "GET" })
  .validator((data) => z.string().parse(data))
  .handler(async ({ data: productId }) => {
    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("created_at");

    if (error) throw error;
    return variants || [];
  });

export const uploadCustomFile = createServerFn({ method: "POST" })
  .validator((data) => z.object({
    fileName: z.string(),
    fileBase64: z.string(),
    userId: z.string(),
  }).parse(data))
  .handler(async ({ data: { fileName, fileBase64, userId } }) => {
    // Convert base64 to buffer
    const buffer = Buffer.from(fileBase64, 'base64');
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
    const filePath = `${userId}/${timestamp}_${safeName}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('customer-uploads')
      .upload(filePath, buffer, {
        contentType: 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('customer-uploads')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl,
    };
  });

export const getShippingRates = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: rates, error } = await supabase
      .from("shipping_rates")
      .select("*")
      .order("region");

    if (error) throw error;
    return rates || [];
  });
