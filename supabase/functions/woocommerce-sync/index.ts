import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

const SECRET_KEYS = JSON.parse(
  Deno.env.get("SUPABASE_SECRET_KEYS")!
);

const SUPABASE_SECRET_KEY = SECRET_KEYS["default"];

const SYNC_SECRET = Deno.env.get("WOOCOMMERCE_SYNC_SECRET")!;

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
);

type WooCommerceImage = {
  src?: string;
  name?: string;
  alt?: string;
};

type WooCommerceCategory = {
  id?: number;
  name?: string;
  slug?: string;
};

type WooCommerceProduct = {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_quantity?: number | null;
  stock_status?: string;
  status?: string;
  catalog_visibility?: string;
  images?: WooCommerceImage[];
  categories?: WooCommerceCategory[];
  type?: string;
};

function jsonResponse(
  body: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type":
          "application/json",
      },
    },
  );
}

function getProductPrice(
  product: WooCommerceProduct,
): number {
  const price =
    product.price ||
    product.sale_price ||
    product.regular_price ||
    "0";

  const parsed =
    Number.parseFloat(price);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function getProductStock(
  product: WooCommerceProduct,
): number {
  if (
    typeof product.stock_quantity ===
      "number" &&
    Number.isFinite(
      product.stock_quantity,
    )
  ) {
    return Math.max(
      0,
      product.stock_quantity,
    );
  }

  if (
    product.stock_status ===
    "outofstock"
  ) {
    return 0;
  }

  return 0;
}

function makeSlug(
  product: WooCommerceProduct,
): string {
  const suppliedSlug =
    (product.slug || "").trim();

  if (suppliedSlug) {
    return suppliedSlug;
  }

  return (product.name || "")
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

function uint8ArrayToBase64(
  bytes: Uint8Array,
): string {
  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length,
        ),
      ),
    );
  }

  return btoa(binary);
}

function constantTimeEqual(
  a: string,
  b: string,
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    result |=
      a.charCodeAt(i) ^
      b.charCodeAt(i);
  }

  return result === 0;
}

async function verifyWooCommerceSignature(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (
    !signature ||
    !secret
  ) {
    return false;
  }

  const encoder =
    new TextEncoder();

  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );

  const signatureBytes =
    new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(rawBody),
      ),
    );

  const expectedSignature =
    uint8ArrayToBase64(
      signatureBytes,
    );

  return constantTimeEqual(
    signature.trim(),
    expectedSignature,
  );
}

async function getOrCreateCategory(
  category:
    | WooCommerceCategory
    | undefined,
) {
  if (!category?.name) {
    return null;
  }

  const name =
    category.name.trim();

  if (!name) {
    return null;
  }

  const slug =
    category.slug?.trim() ||
    name
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );

  const {
    data: existing,
    error: lookupError,
  } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing?.id) {
    return existing.id;
  }

  const {
    data: created,
    error: createError,
  } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
    })
    .select("id")
    .single();

  if (createError) {
    const {
      data: retry,
      error: retryError,
    } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (retryError) {
      throw createError;
    }

    return retry?.id || null;
  }

  return created.id;
}

async function syncProduct(
  product: WooCommerceProduct,
) {
  if (!product.id) {
    throw new Error(
      "WooCommerce product ID is missing.",
    );
  }

  if (!product.name?.trim()) {
    throw new Error(
      `WooCommerce product ${product.id} has no name.`,
    );
  }

  if (
    product.type &&
    product.type !== "simple"
  ) {
    throw new Error(
      `Product ${product.id} is not a simple product. ` +
      `The current storefront synchronization supports simple products only.`,
    );
  }

  const woocommerceProductId =
    Number(product.id);

  const name =
    product.name.trim();

  const slug =
    makeSlug(product);

  const description =
    product.description?.trim() ||
    product.short_description?.trim() ||
    null;

  const price =
    getProductPrice(product);

  const stockQuantity =
    getProductStock(product);

  const imageUrl =
    product.images?.[0]?.src ||
    null;

  const isActive =
    product.status ===
      "publish" &&
    product.catalog_visibility !==
      "hidden";

  const primaryCategory =
    product.categories?.[0];

  const categoryId =
    await getOrCreateCategory(
      primaryCategory,
    );

  const payload = {
    name,
    slug,
    description,
    price,
    category_id: categoryId,
    image_url: imageUrl,
    stock_quantity:
      stockQuantity,
    is_active: isActive,
    woocommerce_product_id:
      woocommerceProductId,
  };

  const {
    data: existing,
    error: lookupError,
  } = await supabase
    .from("products")
    .select("id")
    .eq(
      "woocommerce_product_id",
      woocommerceProductId,
    )
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing?.id) {
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .update(payload)
      .eq(
        "id",
        existing.id,
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      action: "updated",
      product: data,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    action: "created",
    product: data,
  };
}

async function deactivateProduct(
  woocommerceProductId: number,
) {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .update({
      is_active: false,
    })
    .eq(
      "woocommerce_product_id",
      woocommerceProductId,
    )
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    action: data
      ? "deactivated"
      : "not_found",
    product: data,
  };
}

Deno.serve(async (request) => {
  try {
    if (
      request.method ===
      "OPTIONS"
    ) {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin":
            "*",
          "Access-Control-Allow-Headers":
            "content-type, x-wc-webhook-signature, x-wc-webhook-topic, x-wc-webhook-resource, x-wc-webhook-event",
          "Access-Control-Allow-Methods":
            "POST, OPTIONS",
        },
      });
    }

    if (
      request.method !== "POST"
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "POST requests only.",
        },
        405,
      );
    }

    if (!SYNC_SECRET) {
      return jsonResponse(
        {
          success: false,
          message:
            "WOOCOMMERCE_SYNC_SECRET is not configured.",
        },
        500,
      );
    }

    const rawBody =
      await request.text();

    /*
     * WooCommerce webhook verification.
     */
    const trimmedBody =
      rawBody.trim();

    if (
      /^webhook_id=\d+$/.test(
        trimmedBody,
      )
    ) {
      return jsonResponse({
        success: true,
        message:
          "WooCommerce webhook verification received.",
      });
    }

    /*
     * Verify the WooCommerce HMAC
     * signature for real webhook events.
     */
    const signature =
      request.headers.get(
        "x-wc-webhook-signature",
      ) || "";

    const signatureValid =
      await verifyWooCommerceSignature(
        rawBody,
        signature,
        SYNC_SECRET,
      );

    if (!signatureValid) {
      return jsonResponse(
        {
          success: false,
          message:
            "Unauthorized: invalid WooCommerce webhook signature.",
        },
        401,
      );
    }

    let body: any;

    try {
      body =
        JSON.parse(rawBody);
    } catch {
      return jsonResponse(
        {
          success: false,
          message:
            "Invalid JSON payload.",
        },
        400,
      );
    }

    /*
     * Read every WooCommerce event
     * indicator that may be available.
     */
    const webhookTopic =
      (
        request.headers.get(
          "x-wc-webhook-topic",
        ) || ""
      )
        .trim()
        .toLowerCase();

    const webhookEvent =
      (
        request.headers.get(
          "x-wc-webhook-event",
        ) || ""
      )
        .trim()
        .toLowerCase();

    const webhookResource =
      (
        request.headers.get(
          "x-wc-webhook-resource",
        ) || ""
      )
        .trim()
        .toLowerCase();

    /*
     * A delete event can be identified
     * by the webhook topic, webhook event,
     * or a trash/deleted status in the
     * WooCommerce payload.
     */
    const isDeleteEvent =
      webhookTopic ===
        "product.deleted" ||
      webhookTopic ===
        "product.trashed" ||
      webhookTopic.endsWith(
        ".deleted",
      ) ||
      webhookTopic.endsWith(
        ".trashed",
      ) ||
      webhookEvent ===
        "deleted" ||
      webhookEvent ===
        "trashed" ||
      body?.status ===
        "trash" ||
      body?.status ===
        "deleted";

    const product =
      body?.product &&
      typeof body.product ===
        "object"
        ? body.product
        : body;

    if (
      !product ||
      typeof product !==
        "object"
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Invalid product payload.",
        },
        400,
      );
    }

    const productId =
      Number(product.id);

    if (!productId) {
      return jsonResponse(
        {
          success: false,
          message:
            "WooCommerce product ID is missing.",
        },
        400,
      );
    }

    /*
     * Deleted products are not removed
     * from Supabase. They are marked
     * inactive so existing references
     * remain safe.
     */
    if (isDeleteEvent) {
      const result =
        await deactivateProduct(
          productId,
        );

      return jsonResponse({
        success: true,
        ...result,
      });
    }

    /*
     * Normal create/update synchronization.
     */
    const result =
      await syncProduct(
        product,
      );

    return jsonResponse({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "WooCommerce sync error:",
      error,
    );

    return jsonResponse(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown synchronization error.",
      },
      500,
    );
  }
});