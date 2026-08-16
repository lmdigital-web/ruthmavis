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
    queryStringAuth: true // Set to true to allow consumer_key/secret to be sent as query parameters, which works more reliably across different server configurations
  });
};
