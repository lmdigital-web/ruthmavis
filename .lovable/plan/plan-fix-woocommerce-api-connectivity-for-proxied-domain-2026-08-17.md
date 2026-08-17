# Plan: Fix WooCommerce API Connectivity for Proxied Domain

The user reports that the shop works on the Lovable preview subdomain but fails on the primary `ruthmavisaccessories.co.za` domain (which is proxied by Cloudflare). This points to an issue with how the server-side requests from the Lovable application are being handled or authenticated when routed through a proxied environment.

## Proposed Changes

### WooCommerce API Configuration
- Modify `src/lib/woocommerce.server.ts` to improve request headers. When a site is proxied, certain headers like `User-Agent` or `Accept` might be required by the destination server (WordPress/WooCommerce) or the proxy (Cloudflare) to distinguish legitimate API traffic from bot traffic.
- Ensure `queryStringAuth: true` is strictly applied as it's more robust for proxied/HTTPS environments.

### Robust Error Handling & Logging
- Enhance error logging in `src/lib/woocommerce.functions.ts` to capture more detail about the failure (e.g., specific Cloudflare error codes like 403 or 52x if visible).
- Implement a more descriptive fallback UI when the API fails so the user sees a clear "Connection Error" rather than a generic "Page didn't load" crash.

### User Instructions
- The user likely needs to add the Lovable server's IP range to their Cloudflare/WordPress whitelist if they have aggressive firewall rules (WAF).
- Verify that `WOOCOMMERCE_KEY` and `WOOCOMMERCE_SECRET` are correctly set in the Cloudflare Pages environment variables for the production build.

## Technical Details
- **File**: `src/lib/woocommerce.server.ts`
- **Action**: Add custom `headers` to `axiosConfig` to simulate a real browser or a standard client.
- **File**: `src/lib/woocommerce.functions.ts`
- **Action**: Add more context to the console logs in the `.catch` blocks.
