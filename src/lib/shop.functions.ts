import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const shopCategorySlugs = [
  "bibles",
  "bible-combos",
  "crochet-bags",
  "devotions",
  "bible-bags",
  "journals",
  "other-accessories",
] as const;

export const getProducts = createServerFn({ method: "GET" })
  .validator((data) => z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(["newest", "price-low", "price-high", "name-az", "name-za"]).optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    let categoryId: string | null = null;

    if (data.category && data.category !== "all") {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", data.category)
        .maybeSingle();

      if (categoryError) throw categoryError;
      categoryId = category?.id ?? null;
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (data.search) {
      query = query.ilike("name", `%${data.search}%`);
    }

    const sort = data.sort ?? "newest";
    const sortConfig = {
      newest: { column: "created_at", ascending: false },
      "price-low": { column: "price", ascending: true },
      "price-high": { column: "price", ascending: false },
      "name-az": { column: "name", ascending: true },
      "name-za": { column: "name", ascending: false },
    } as const;

    const { data: products, error } = await query.order(sortConfig[sort].column, {
      ascending: sortConfig[sort].ascending,
    });

    if (error) throw error;

    if (!products || products.length === 0) {
      return [];
    }

    const categoryIds = [...new Set(products.map((product: any) => product.category_id).filter(Boolean))];

    const { data: categories, error: categoriesError } = categoryIds.length
      ? await supabase
          .from("categories")
          .select("id, name, slug")
          .in("id", categoryIds)
      : { data: [], error: null };

    if (categoriesError) throw categoriesError;

    const categoryMap = new Map(
      (categories || []).map((category: any) => [category.id, category])
    );

    return products.map((product: any) => ({
      ...product,
      categories: product.category_id ? categoryMap.get(product.category_id) ?? null : null,
    }));
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

    if (product.product_images) {
      product.product_images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
    }

    return product;
  });

export const getCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .in("slug", shopCategorySlugs);

    if (error) throw error;

    const categoryMap = new Map(
      (categories || []).map((category: any) => [category.slug, category])
    );

    return shopCategorySlugs
      .map((slug) => categoryMap.get(slug))
      .filter(Boolean);
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
    const buffer = Buffer.from(fileBase64, 'base64');
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
