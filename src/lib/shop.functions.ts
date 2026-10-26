import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";


const WOOCOMMERCE_STORE_API = "https://shop.ruthmavisaccessories.co.za/wp-json/wc/store/v1";

// Cache successful price data for one hour and cache failed refreshes for 15 minutes.
// This prevents every storefront visit from triggering three WooCommerce API requests.
const PRICE_CACHE_TTL_SECONDS = 60 * 60;
const PRICE_FAILURE_CACHE_TTL_SECONDS = 15 * 60;
const PRICE_CACHE_KEY = new Request(
  "https://ruthmavisaccessories.co.za/__internal-cache/woocommerce-price-map-v1",
  { method: "GET" },
);

type WooPriceRecord = {
  id: number;
  prices: {
    price?: string | number | null;
    regular_price?: string | number | null;
    sale_price?: string | number | null;
    currency_minor_unit?: number;
  } | null;
};

type WooPriceCachePayload = {
  failed?: boolean;
  fetchedAt: string;
  products: WooPriceRecord[];
};

let localPriceCache: { expiresAt: number; prices: Map<number, WooPriceRecord> } | null = null;
let priceRefreshInFlight: Promise<Map<number, WooPriceRecord>> | null = null;

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

function priceMapFromPayload(payload: WooPriceCachePayload): Map<number, WooPriceRecord> {
  return new Map(
    (payload.products || [])
      .filter((product) => Number.isInteger(Number(product.id)))
      .map((product) => [Number(product.id), product]),
  );
}

async function savePriceCache(
  cache: Cache | undefined,
  payload: WooPriceCachePayload,
  ttlSeconds: number,
) {
  const prices = priceMapFromPayload(payload);
  localPriceCache = { expiresAt: Date.now() + ttlSeconds * 1000, prices };

  if (cache) {
    try {
      await cache.put(
        PRICE_CACHE_KEY,
        new Response(JSON.stringify(payload), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": `public, max-age=${ttlSeconds}`,
          },
        }),
      );
    } catch (error) {
      console.error("Unable to persist WooCommerce price cache:", error);
    }
  }

  return prices;
}

async function loadWooCommercePriceMap(): Promise<Map<number, WooPriceRecord>> {
  if (localPriceCache && localPriceCache.expiresAt > Date.now()) {
    return localPriceCache.prices;
  }

  if (priceRefreshInFlight) return priceRefreshInFlight;

  priceRefreshInFlight = (async () => {
    const edgeCache = (globalThis as any).caches?.default as Cache | undefined;

    if (edgeCache) {
      try {
        const cachedResponse = await edgeCache.match(PRICE_CACHE_KEY);
        if (cachedResponse) {
          const payload = await cachedResponse.json() as WooPriceCachePayload;
          const ttl = payload.failed ? PRICE_FAILURE_CACHE_TTL_SECONDS : PRICE_CACHE_TTL_SECONDS;
          const prices = priceMapFromPayload(payload);
          localPriceCache = { expiresAt: Date.now() + ttl * 1000, prices };
          console.log("WooCommerce pricing cache:", payload.failed ? "recent refresh failed; suppressing retries" : "hit", "products", prices.size);
          return prices;
        }
      } catch (error) {
        console.error("Unable to read WooCommerce price cache:", error);
      }
    }

    // Never fall back to uncached per-request API calls. If the shared Worker
    // cache is unavailable, use Supabase prices rather than risk another request storm.
    if (!edgeCache) {
      console.error("WooCommerce pricing cache unavailable; using Supabase price fallback without calling WooCommerce.");
      return new Map<number, WooPriceRecord>();
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("woocommerce_product_id")
      .eq("is_active", true);

    if (error || !products) {
      console.error("Unable to load product IDs for WooCommerce price refresh:", error);
      return new Map<number, WooPriceRecord>();
    }

    const ids = [...new Set(products
      .map((product: any) => Number(product.woocommerce_product_id))
      .filter((id: number) => Number.isInteger(id) && id > 0))];

    if (ids.length === 0) {
      return savePriceCache(edgeCache, { fetchedAt: new Date().toISOString(), products: [] }, PRICE_CACHE_TTL_SECONDS);
    }

    const fetchedProducts: WooPriceRecord[] = [];
    let refreshFailed = false;

    for (let index = 0; index < ids.length; index += 100) {
      const batch = ids.slice(index, index + 100);
      const requestUrl = `${WOOCOMMERCE_STORE_API}/products?include=${batch.join(",")}&per_page=100`;

      try {
        const response = await fetch(requestUrl, {
          headers: {
            Accept: "application/json",
            "User-Agent": "RuthMavisStorefrontPriceSync/1.0 (+https://ruthmavisaccessories.co.za)",
            "X-RuthMavis-Request": "storefront-price-sync",
          },
        });

        console.log("WooCommerce price refresh:", {
          timestampUtc: new Date().toISOString(),
          requestedProducts: batch.length,
          status: response.status,
          cfRay: response.headers.get("cf-ray"),
        });

        if (!response.ok) {
          const responseBody = await response.text().catch(() => "");
          console.error("WooCommerce price refresh failed:", response.status, responseBody.slice(0, 200));
          refreshFailed = true;
          break;
        }

        const result = await response.json();
        if (!Array.isArray(result)) {
          console.error("WooCommerce price refresh returned an unexpected response.");
          refreshFailed = true;
          break;
        }

        fetchedProducts.push(...result.map((product: any) => ({
          id: Number(product.id),
          prices: product.prices ?? null,
        })));
      } catch (error) {
        console.error("WooCommerce price refresh request failed:", error);
        refreshFailed = true;
        break;
      }
    }

    if (refreshFailed) {
      // Cache the failure briefly to stop repeated visitors from retrying the
      // blocked endpoint. Keep any older local successful cache if one exists.
      await savePriceCache(edgeCache, {
        failed: true,
        fetchedAt: new Date().toISOString(),
        products: [],
      }, PRICE_FAILURE_CACHE_TTL_SECONDS);
      return new Map<number, WooPriceRecord>();
    }

    const payload: WooPriceCachePayload = {
      fetchedAt: new Date().toISOString(),
      products: fetchedProducts,
    };
    console.log("WooCommerce price refresh succeeded; cached products:", fetchedProducts.length);
    return savePriceCache(edgeCache, payload, PRICE_CACHE_TTL_SECONDS);
  })();

  try {
    return await priceRefreshInFlight;
  } finally {
    priceRefreshInFlight = null;
  }
}

/**
 * Use cached WooCommerce pricing to enrich Supabase products. Successful data is
 * cached at the Cloudflare edge for one hour; failed refreshes are suppressed for
 * 15 minutes to prevent request storms. Supabase remains the fallback source.
 */
async function enrichProductsWithWooCommercePrices(products: any[]) {
  const enriched = products.map(normaliseProductPrice);
  const wooProductsById = await loadWooCommercePriceMap();

  return enriched.map((product) => {
    const wooId = Number(product.woocommerce_product_id);
    const prices = wooProductsById.get(wooId)?.prices;
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
