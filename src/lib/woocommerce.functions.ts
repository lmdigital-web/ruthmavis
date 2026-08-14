import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getWooCommerceClient } from "./woocommerce.server";

// Cache products slightly or use a more robust caching strategy if needed
export const getWooProducts = createServerFn({ method: "GET" })
  .validator((data) => z.object({ 
    category: z.string().optional(),
    search: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const api = getWooCommerceClient();
    
    try {
      const params: any = {
        per_page: 20,
        status: 'publish',
      };

      if (data.search) {
        params.search = data.search;
      }

      if (data.category && data.category !== 'all') {
        // We need to find the category ID first by slug
        const catRes = await api.get("products/categories", { slug: data.category });
        if (catRes.data && catRes.data.length > 0) {
          params.category = catRes.data[0].id;
        }
      }

      const response = await api.get("products", params);
      
      // Map WooCommerce product format to our local UI format
      return response.data.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        slug: p.slug,
        price: parseFloat(p.price || "0"),
        description: p.description.replace(/<[^>]*>?/gm, ''), // Simple tag strip
        image_url: p.images[0]?.src || "/placeholder.jpg",
        categories: {
          name: p.categories[0]?.name || "Uncategorized",
          slug: p.categories[0]?.slug || "uncategorized"
        },
        stock_quantity: p.stock_quantity || 0,
        in_stock: p.stock_status === 'instock'
      }));
    } catch (error: any) {
      console.error("WooCommerce API Error:", error.response?.data || error.message);
      throw new Error("Failed to fetch products from WooCommerce");
    }
  });

export const getWooProductBySlug = createServerFn({ method: "GET" })
  .validator((data) => z.string().parse(data))
  .handler(async ({ data: slug }) => {
    const api = getWooCommerceClient();
    try {
      const response = await api.get("products", { slug });
      const p = response.data[0];
      if (!p) throw new Error("Product not found");

      return {
        id: p.id.toString(),
        name: p.name,
        slug: p.slug,
        price: parseFloat(p.price || "0"),
        description: p.description, // Keep HTML for details page
        image_url: p.images[0]?.src || "/placeholder.jpg",
        categories: {
          name: p.categories[0]?.name || "Uncategorized",
          slug: p.categories[0]?.slug || "uncategorized"
        },
        stock_quantity: p.stock_quantity || 0,
        in_stock: p.stock_status === 'instock',
        attributes: p.attributes || [],
        variations: p.variations || []
      };
    } catch (error: any) {
      console.error("WooCommerce API Error:", error.response?.data || error.message);
      throw new Error("Failed to fetch product details");
    }
  });

export const getWooCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const api = getWooCommerceClient();
    try {
      const response = await api.get("products/categories", { hide_empty: true });
      return response.data.map((c: any) => ({
        id: c.id.toString(),
        name: c.name,
        slug: c.slug
      }));
    } catch (error) {
      console.error("WooCommerce Categories Error:", error);
      return [];
    }
  });

export const getWooProductVariations = createServerFn({ method: "GET" })
  .validator((data) => z.string().parse(data))
  .handler(async ({ data: productId }) => {
    const api = getWooCommerceClient();
    try {
      const response = await api.get(`products/${productId}/variations`);
      return response.data.map((v: any) => ({
        id: v.id.toString(),
        sku: v.sku,
        price_modifier: parseFloat(v.price || "0") - 0, // WooCommerce variations usually have absolute prices
        size: v.attributes.find((a: any) => a.name.toLowerCase() === 'size')?.option || '',
        color: v.attributes.find((a: any) => a.name.toLowerCase() === 'color')?.option || '',
        stock_quantity: v.stock_quantity || 0,
        in_stock: v.stock_status === 'instock'
      }));
    } catch (error) {
      console.error("WooCommerce Variations Error:", error);
      return [];
    }
  });

export const uploadCustomFile = createServerFn({ method: "POST" })
  .validator((data) => z.object({
    fileName: z.string(),
    fileBase64: z.string(),
    userId: z.string(),
  }).parse(data))
  .handler(async ({ data: { fileName, fileBase64, userId } }) => {
    // We can still use Supabase Storage for files even if products come from Woo
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(process.env['SUPABASE_URL']!, process.env['SUPABASE_PUBLISHABLE_KEY']!);

    const buffer = Buffer.from(fileBase64, 'base64');
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
    const filePath = `${userId}/${timestamp}_${safeName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('customer-uploads')
      .upload(filePath, buffer, {
        contentType: 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase
      .storage
      .from('customer-uploads')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl,
    };
  });
