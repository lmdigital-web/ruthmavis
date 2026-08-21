# Cart & Checkout Implementation Plan

The user reported three main issues:
1.  **Cart Syncing:** Products added to the cart do not show in the CartDrawer until the page is refreshed.
2.  **Cart UI:** The checkout button in the CartDrawer is too large.
3.  **Checkout Flow:** Clicking "Checkout" redirects to login instead of the checkout page, and guest checkout is not supported.

## Technical Details

### 1. Fix Cart Syncing
Replace the custom `useCart` hook (which used local state and manual `localStorage` syncing) with a **Zustand store** with persistence. This ensures state is globally accessible and updates are reactive across all components (SiteNav, CartDrawer, etc.) without requiring a refresh.

### 2. Adjust Cart Drawer UI
Modify the `CartDrawer` component's checkout button:
- Reduce padding and font size to make it "smaller" as requested.
- Ensure the button remains prominent but better proportioned.

### 3. Reform Checkout Flow
- Move the checkout route from `src/routes/_authenticated/checkout.tsx` to `src/routes/checkout.tsx` to make it publicly accessible.
- Update the checkout logic to handle both authenticated users and guests.
- If a guest checks out, we will skip the `user_id` in the order record or handle it as `null`.

## Implementation Steps

### Done
- Replaced `use-cart.tsx` with Zustand implementation.
- Updated `SiteNav.tsx` and `CartDrawer.tsx` to use the new Zustand store.
- Updated `src/routes/admin/index.tsx` with the new verbatim text.

### To Do
- [ ] Move `src/routes/_authenticated/checkout.tsx` to `src/routes/checkout.tsx`.
- [ ] Update `src/routes/checkout.tsx` to support guest checkout (handle missing `user` and `email`).
- [ ] Adjust CSS for the checkout button in `CartDrawer.tsx`.
