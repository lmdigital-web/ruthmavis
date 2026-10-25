import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";


const WOOCOMMERCE_STORE_API = "https://shop.ruthmavisaccessories.co.za/wp-json/wc/store/v1";

function normaliseProductPrice(product: any) {
  const currentPrice = Number(product.price);
  const regularPrice = Number(product.regular_price ?? product.price);
  const salePrice = product.sale_price == null || product.sale_price === ""
    ? null
    : Number(product.sale_price);
  const isOnSale = Number.isFinite(regularPrice) && Number.isFinite(currentPrice) && regularPrice > currentPrice;

  return {
    ...product,
    price: Number.isFinite(currentPrice) ? currentPrice : 0,
    regular_price: isOnSale ? regularPrice : null,
    sale_price: isOnSale ? (salePrice ?? currentPrice) : null,
  };
}

/**
 * Read public WooCommerce Store API prices so the main React storefront uses
 * WooCommerce's active price while retaining the regular price for sale display.
 * If a WooCommerce request fails, keep the existing Supabase price as a fallback.
 */
async function enrichProductsWithWooCommercePrices(products: any[]) {
  const enriched = products.map(normaliseProductPrice);
  const productsByWooId = new Map<number, any>();

  for (const product of products) {
    const wooId = Number(product.woocommerce_product_id);
    if (Number.isInteger(wooId) && wooId > 0) {
      productsByWooId.set(wooId, product);
    }
  }

  const wooIds = [...productsByWooId.keys()];
  console.log("WooCommerce pricing diagnostic: Supabase products", products.length, "with WooCommerce IDs", wooIds.length);
  if (wooIds.length === 0) return enriched;

  const wooProducts: any[] = [];
  for (let index = 0; index < wooIds.length; index += 100) {
    const batch = wooIds.slice(index, index + 100);
    try {
      const requestUrl = `${WOOCOMMERCE_STORE_API}/products?include=${batch.join(",")}&per_page=100`;
      const requestTimestamp = new Date().toISOString();
      const requestUserAgent = "RuthMavisStorefrontPriceSync/1.0 (+https://ruthmavisaccessories.co.za)";
      const response = await fetch(requestUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": requestUserAgent,
          "X-RuthMavis-Request": "storefront-price-sync",
        },
      });
      const responseHeaders: Record<string, string> = {};
      for (const name of ["server", "via", "cf-ray", "x-request-id", "x-mod-security", "x-stackprotect", "content-type"]) {
        const value = response.headers.get(name);
        if (value) responseHeaders[name] = value;
      }
      console.log("WooCommerce outbound request diagnostic:", {
        timestampUtc: requestTimestamp,
        url: requestUrl,
        method: "GET",
        userAgent: requestUserAgent,
        identifyingHeader: "X-RuthMavis-Request: storefront-price-sync",
        status: response.status,
        responseHeaders,
      });
if (!response.ok) {
        const responseBody = await response.text().catch(() => "");
        console.error("WooCommerce price request failed:", response.status, responseBody.slice(0, 300));
        continue;
      }
      const result = await response.json();
      console.log("WooCommerce pricing diagnostic: API status", response.status, "requested IDs", batch.length, "returned products", Array.isArray(result) ? result.length : "not-array");
      if (Array.isArray(result)) wooProducts.push(...result);
    } catch (error) {
      console.error("Unable to load WooCommerce sale prices:", error);
    }
  }

  const wooById = new Map<number, any>(
    wooProducts.map((product) => [Number(product.id), product])
  );
  console.log("WooCommerce pricing diagnostic: returned IDs", [...wooById.keys()].slice(0, 20));

  return enriched.map((product) => {
    const wooId = Number(product.woocommerce_product_id);
    const wooProduct = wooById.get(wooId);
    const prices = wooProduct?.prices;
    if (!prices) return product;

    const minorUnit = Number(prices.currency_minor_unit ?? 2);
    const divisor = Math.pow(10, Number.isFinite(minorUnit) ? minorUnit : 2);
    const parseWooPrice = (value: unknown): number | null => {
      if (value == null || value === "") return null;
      const amount = Number(value);
      return Number.isFinite(amount) ? amount / divisor : null;
    };

    const currentPrice = parseWooPrice(prices.price);
    const regularPrice = parseWooPrice(prices.regular_price);
    const salePrice = parseWooPrice(prices.sale_price);
    if (currentPrice == null) return product;

    const isOnSale = regularPrice != null && currentPrice < regularPrice;
    if (isOnSale) console.log("WooCommerce pricing diagnostic: sale matched", product.slug, wooId, regularPrice, currentPrice);
    return {
      ...product,
      price: currentPrice,
      regular_price: isOnSale ? regularPrice : null,
      sale_price: isOnSale ? (salePrice ?? currentPrice) : null,
    };
  });
}

const shopCategorySlugs = [
  "bibles",
  "bible-combos",
  "crochet-bags",
  "devotions",
  "bible-bags",
  "journals",
  "other-accessories",
  "bulk-buying",
  "other-books",
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

    const productsWithCategories = products.map((product: any) => ({
      ...product,
      categories: product.category_id ? categoryMap.get(product.category_id) ?? null : null,
    }));

    return enrichProductsWithWooCommercePrices(productsWithCategories);
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

    const [productWithWooCommercePrice] = await enrichProductsWithWooCommercePrices([product]);
    return productWithWooCommercePrice;
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
