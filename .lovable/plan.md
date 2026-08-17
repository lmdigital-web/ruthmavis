# Security Fixes Plan

Following up on the security scan, this plan addresses critical risks in data handling, payment verification, and access control.

## Proposed Changes

### 1. Payment Verification (Critical)
*   **Current Issue**: `/payment-verify` performs client-side verification of Paystack transactions using a public key. This is easily bypassable.
*   **Fix**: Move verification to a `createServerFn` to use the `PAYSTACK_SECRET_KEY` on the server.
*   **Impact**: Prevents fraudulent "successful" order status updates.

### 2. XSS Protection in Admin Dashboard
*   **Current Issue**: The admin dashboard might render user-provided content (e.g., product descriptions) without sanitization.
*   **Fix**: Apply `dompurify` in `AdminProducts.tsx` when rendering product descriptions (if applicable) and ensure all user inputs are sanitized before rendering.

### 3. File Upload Security (Storage)
*   **Current Issue**: `uploadCustomFile` currently uses a hardcoded `'customer'` userId and lacks strict ownership checks.
*   **Fix**: Integrate `requireSupabaseAuth` middleware to ensure only logged-in users can upload, and use their actual `userId` for the storage path.

### 4. Admin Access Hardening
*   **Current Issue**: Role checks are repeated in every admin server function.
*   **Fix**: Refactor role validation into a reusable utility or middleware to ensure consistency across all admin endpoints.

### 5. Secure Auth Spacing
*   **Current Issue**: The login/register hero sections fixed spacing, but we should ensure no sensitive user data is leaked in error messages or logs.

## Technical Details

### Verification Move
*   Update `src/routes/payment-verify.tsx` to call a new server function `verifyPaystackPayment`.
*   Implement `verifyPaystackPayment` in `src/routes/_authenticated/checkout.tsx` (or a utility file) using `node-fetch` or native `fetch` on the server.

### Storage Middleware
*   Add `.middleware([requireSupabaseAuth])` to `uploadCustomFile` in `src/lib/woocommerce.functions.ts`.
*   Update the handler to use `context.userId`.

### Role Middleware
*   Create a `requireAdminAuth` middleware that wraps `requireSupabaseAuth` and adds a profile role check.
