# Plan: Fix Shop Loading and Cart Drawer Issues

I will fix the "This page didn't load" error on the shop page by implementing a fallback mechanism and better error handling. I will also fix the `Dialog` hook error in the `CartDrawer` by ensuring it only renders after hydration.

## User Review Required

> [!IMPORTANT]
> To fully fix the shop loading on your main domain, you must ensure the `WOOCOMMERCE_KEY` and `WOOCOMMERCE_SECRET` environment variables are added to your **Cloudflare Pages** project settings, as they are required for the production build.

## Proposed Changes

### WooCommerce Integration
- Add a client-side fallback to `getWooProducts` and `getWooCategories` so the UI doesn't crash if the server-side API call fails.
- Improve logging in the server functions to capture the exact reason for failures (e.g., DNS, timeout, or authentication).
- Implement a simple "Demo Mode" in the shop page that shows placeholder products if the API is unreachable, ensuring the page always loads something.

### Components
- Wrap the `CartDrawer` content in a `ClientOnly` component or a `useEffect` hydration check to fix the `TypeError: Cannot read properties of null (reading 'useRef')` error caused by Radix Dialog running during SSR.
- Update `SiteNav.tsx` to ensure the `CartDrawer` is mounted safely.

## Technical Details

- **File**: `src/lib/woocommerce.functions.ts`
  - Wrap `api.get` calls in more robust try/catch blocks.
  - Return empty arrays or cached data instead of throwing errors that trigger the global ErrorBoundary.
- **File**: `src/components/CartDrawer.tsx`
  - Implement a `useHydrated` hook or similar pattern to delay rendering the `Sheet` component until the client is ready.
- **File**: `src/routes/shop.tsx`
  - Add error state UI to handle cases where the API returns no products.

## Verification Plan

1. **Automated Tests**:
   - Run a Playwright script to verify navigation to `/shop` no longer triggers the "This page didn't load" error.
   - Verify the `CartDrawer` opens without console errors.
2. **Manual Verification**:
   - Check the preview to ensure the shop page renders its layout even if the API fails.
   - Confirm the cart drawer functions correctly.
