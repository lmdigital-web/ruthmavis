import WooCommerceRestApiPackage from "@woocommerce/woocommerce-rest-api";

// Use the sub-domain as the base URL
const WOOCOMMERCE_URL = "https://shop.ruthmavisaccessories.co.za";

export const getWooCommerceClient = () => {
  // Always read from process.env inside the function for server-side security
  const consumerKey = process.env['WOOCOMMERCE_KEY'];
  const consumerSecret = process.env['WOOCOMMERCE_SECRET'];

  if (!consumerKey || !consumerSecret) {
    console.error("CRITICAL: WooCommerce API keys are missing in the current environment.");
    throw new Error("WooCommerce API keys are not configured in environment variables.");
  }

  // Handle potential ESM/CJS interop issues with the WooCommerce package
  const WooCommerceRestApi = (WooCommerceRestApiPackage as any).default || WooCommerceRestApiPackage;
  
  return new WooCommerceRestApi({
    url: WOOCOMMERCE_URL,
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    version: "wc/v3",
    // Re-enable queryStringAuth: true for standard HTTPS setups
    queryStringAuth: true 
  });
};
