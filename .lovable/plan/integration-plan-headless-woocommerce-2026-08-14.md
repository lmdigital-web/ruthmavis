# Integration Plan: Headless WooCommerce

Integrate the existing Ruth Mavis Accessories storefront with a WooCommerce sub-domain (`shop.ruthmavisaccessories.co.za`) to handle products, categories, and inventory.

## User Review Required

> [!IMPORTANT]
> - **CORS Verification**: Ensure the "CORS" plugin on WordPress is configured to allow `ruthmavisaccessories.co.za` (and its dev sub-domains) to make requests.
> - **Legacy API**: In WordPress, go to **WooCommerce > Settings > Advanced > Legacy API** and ensure "Enable the legacy REST API" is checked.

## Proposed Changes

### Core Integration
- **API Client**: Set up `@woocommerce/woocommerce-rest-api` using the provided Consumer Key and Secret.
- **Data Sync**: Switch the Storefront's `getProducts`, `getCategories`, and `getProductBySlug` functions to fetch live data from WooCommerce instead of the local database.

### Product & Inventory
- **Live Stock**: Display real-time inventory status from WooCommerce (In Stock / Sold Out).
- **Variations**: Support WooCommerce product variations (Size/Color) with dynamic price updates.
- **Rich Content**: Render HTML product descriptions directly from WordPress for full formatting support.

### Checkout Strategy (Headless)
- **Cart Sync**: Keep the current lightning-fast frontend cart for the user experience.
- **Handoff**: On checkout, redirect the user to the WooCommerce cart on the sub-domain (`shop.ruthmavisaccessories.co.za/cart/`) to complete the purchase securely using established WordPress payment gateways.

## Technical Details

- **Environment**: Secrets `WOOCOMMERCE_KEY` and `WOOCOMMERCE_SECRET` have been securely added.
- **Utilities**:
    - `src/lib/woocommerce.server.ts`: Server-side API client initialization.
    - `src/lib/woocommerce.functions.ts`: TanStack Server Functions for fetching data.
- **UI Components**:
    - Updated `src/routes/shop.tsx` to use live WooCommerce data.
    - Updated `src/routes/product.$slug.tsx` for variation selection and rich text descriptions.
