import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [
      { count: totalProducts },
      { count: activeOrders },
      { data: salesData }
    ] = await Promise.all([
      supabase.from("products").select("*", { count: 'exact', head: true }),
      supabase.from("orders").select("*", { count: 'exact', head: true }).neq("status", "completed").neq("status", "cancelled"),
      supabase.from("orders").select("total_amount").eq("status", "completed")
    ]);

    const totalSales = salesData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

    return {
      totalProducts: totalProducts || 0,
      activeOrders: activeOrders || 0,
      totalSales
    };
  });

export const getAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data: products, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return products;
  });

export const createAdminProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((data) => z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    price: z.number().min(0),
    stock_quantity: z.number().int().min(0),
    category_id: z.string().uuid().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    is_active: z.boolean().default(true),
    additional_images: z.array(z.string().url()).optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { additional_images, ...productData } = data;
    
    const insertData = {
      ...productData,
      description: productData.description ?? null,
      category_id: productData.category_id ?? null,
      image_url: productData.image_url ?? null,
    };
    
    const { data: product, error } = await supabase.from("products").insert(insertData as any).select().single();
    if (error) throw error;

    if (additional_images && additional_images.length > 0) {
      const imageInserts = additional_images.map((url, index) => ({
        product_id: product.id,
        url,
        display_order: index
      }));
      const { error: imgError } = await supabase.from("product_images").insert(imageInserts);
      if (imgError) throw imgError;
    }

    return { success: true, id: product.id };
  });

export const updateAdminProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    price: z.number().min(0).optional(),
    stock_quantity: z.number().int().min(0).optional(),
    category_id: z.string().uuid().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    is_active: z.boolean().optional(),
    additional_images: z.array(z.string().url()).optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { id, additional_images, ...updates } = data;
    
    const cleanUpdates: any = { ...updates };
    if ('description' in updates) cleanUpdates.description = updates.description ?? null;
    if ('category_id' in updates) cleanUpdates.category_id = updates.category_id ?? null;
    if ('image_url' in updates) cleanUpdates.image_url = updates.image_url ?? null;

    const { error } = await supabase.from("products").update(cleanUpdates).eq("id", id);
    if (error) throw error;

    if (additional_images !== undefined) {
      // Simplest way: delete all and re-insert
      await supabase.from("product_images").delete().eq("product_id", id);
      
      if (additional_images.length > 0) {
        const imageInserts = additional_images.map((url, index) => ({
          product_id: id,
          url,
          display_order: index
        }));
        const { error: imgError } = await supabase.from("product_images").insert(imageInserts);
        if (imgError) throw imgError;
      }
    }

    return { success: true };
  });

export const deleteAdminProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((data) => z.string().uuid().parse(data))
  .handler(async ({ context, data: id }) => {
    const { supabase } = context;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  });

export const getProductAdditionalImages = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .inputValidator((data) => z.string().uuid().parse(data))
  .handler(async ({ context, data: productId }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });
    
    if (error) throw error;
    return data;
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, profiles(full_name, email), order_items(*, products(name))")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return orders;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((data) => z.object({
    orderId: z.string().uuid(),
    status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase } = context;

    const { error } = await supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.orderId);

    if (error) throw error;
    return { success: true };
  });
