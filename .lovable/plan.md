# Shopify-style Checkout Implementation

The goal is to recreate a clean, professional multi-column checkout experience inspired by Shopify, ensuring it handles guest checkout, detailed customer information, and accurate shipping/tax calculations.

## Proposed Changes

### 1. Checkout Page Redesign (`src/routes/checkout.tsx`)
- **Layout**: Switch to a two-column layout (70/30 or 60/40) on large screens.
  - Left column: Express checkout options, Contact information, Shipping address.
  - Right column (sticky): Order summary with product images, subtotal, shipping, taxes, and total.
- **Form Fields**: 
  - Add "First Name" and "Last Name" fields.
  - Add "Phone Number" field.
  - Add "Apartment, suite, etc. (optional)" field.
- **Styling**: 
  - Use a cleaner, light-gray background for the summary column.
  - Use standard Shopify-style input fields with floating labels or clear outlines.
  - Implement breadcrumbs (Cart > Information > Shipping > Payment).
- **Functionality**:
  - Maintain the existing Paystack integration.
  - Ensure all new fields are captured in the `orders` table `shipping_details` JSONB column.

### 2. Database & Data Model
- Update `shipping_details` structure in the checkout form to include `firstName`, `lastName`, and `phone`.

### 3. User Experience
- Ensure the cart total and shipping estimates update dynamically based on the selected region.
- Add a "Return to cart" link.

## Technical Details
- **CSS**: Use Tailwind's `lg:grid-cols-[1fr_400px]` for the specific sidebar width.
- **Components**: Utilize shadcn/ui `Separator` and `Badge` for cleaner summary lines.
- **State Management**: Use the existing `useCart` (Zustand) and `useAuth` hooks.
