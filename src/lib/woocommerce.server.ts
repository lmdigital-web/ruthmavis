import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Use the sub-domain as the base URL
const WOOCOMMERCE_URL = "https://shop.ruthmavisaccessories.co.za";

export const getWooCommerceClient = () => {
  // Always read from process.env inside the function for server-side security
  const consumerKey = process.env['WOOCOMMERCE_KEY'];
  const consumerSecret = process.env['WOOCOMMERCE_SECRET'];

  if (!consumerKey || !consumerSecret) {
    throw new Error("WooCommerce API keys are not configured in environment variables.");
  }

  return new WooCommerceRestApi({
    url: WOOCOMMERCE_URL,
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    version: "wc/v3",
    queryStringAuth: true // Use true for non-HTTPS or certain server configurations, or if modern REST API requires it with specific keys
  });
};
