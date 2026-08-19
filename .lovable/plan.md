# Plan: Native Storefront Migration

Move all e-commerce functionality from WooCommerce to the native Lovable Cloud backend to resolve connectivity issues and provide a seamless admin experience.

## User Review Required

> [!IMPORTANT]
> This switch means your product data and orders will now live directly in the Lovable Cloud database instead of WordPress. You will manage everything (products, stock, orders) through the `/admin` dashboard of this site.

- **Admin Account**: You already have one (Ruth.mavis0803@gmail.com).
- **Products**: You will need to re-add your products in the new admin area (or I can help migrate them if you have a list).
- **Payments**: We will use the existing Paystack integration which is already partially set up for this backend.

## Proposed Changes

### Core Backend (Supabase)
- Re-verify all RLS policies for `products`, `product_variants`, `categories`, `orders`, and `order_items`.
- Ensure the admin user has full write access while customers only have read access (except for creating orders).

### Shop Frontend
- Update `src/routes/shop.tsx` to import from `src/lib/shop.functions.ts` instead of WooCommerce.
- Update `src/routes/product.$slug.tsx` to use native database fetching.
- Simplify `use-cart.tsx` to align strictly with the native schema.

### Admin Dashboard
- Enhance the `/admin` routes to support full Product CRUD (Create, Read, Update, Delete).
- Ensure the Order management system correctly handles status updates (Pending -> Paid -> Processing -> Completed).

### Checkout Flow
- Re-enable the Paystack payment flow in `src/routes/_authenticated/checkout.tsx`.
- Link the payment verification callback to update the native order status.

## Technical Details

- **Functions**: Shift `getWooProducts` -> `getProducts` in all routes.
- **Middleware**: Enforce `requireAdminAuth` on all product management server functions.
- **Storage**: Use the `product-images` bucket for all native product media.
- **Environment**: WooCommerce keys will no longer be required once migration is complete.
