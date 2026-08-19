# Plan - Full E-commerce Admin Backend

Build out the missing administrative sections (Customers, Payment Settings, Shipping Management, and Email Notifications) to complete the native e-commerce solution.

## Database Schema Enhancements
- Create `store_settings` table for global configuration (Tax, Currency, Contact info).
- Create `email_templates` table (optional, or hardcoded initially) for notification management.
- Ensure all new tables have RLS and proper `GRANT`s for `authenticated` (admin) and `service_role`.

## Admin Dashboard UI Expansion
- **Navigation Update**: Add "Customers", "Shipping", and "Settings" to the admin sidebar.
- **Customers Page**: List all registered users, view purchase history.
- **Shipping Management**: UI to manage the existing `shipping_rates` table (Add/Edit/Delete regions).
- **Settings Page**:
    - **Payment**: Configure Paystack integration (display status, public key).
    - **General**: Update store contact/notification emails.
    - **Tax**: Adjust VAT rates.

## Backend Functions
- `getCustomers`: Fetch user profiles and basic order summaries.
- `updateShippingRate`: Admin-only mutation for shipping costs.
- `get/updateStoreSettings`: Server functions to persist configuration.

## User Notification System
- Implement a basic notification service (server-side) triggered on order status changes (e.g., "Paid", "Shipped").

## Technical Details
- Use `createServerFn` for all new admin actions.
- Enforce `admin` role check in all relevant functions via Supabase role verification.
- Maintain existing `blush/gold` design aesthetic in new dashboard sections.
