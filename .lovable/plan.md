# Fix Registration and Account Pages

The goal is to fix the registration page (ensure email and all fields are functional), clean up the account page (proper address fields instead of JSON), and ensure a smooth ecommerce experience for Ruth Mavis Accessories.

## User Review Required

> [!IMPORTANT]
> The admin account for `Ruth.mavis0803@gmail.com` already exists in the database and is correctly assigned the `admin` role. You should be able to log in at `/login` and then access `/admin`.

## Proposed Changes

### Registration Page (`src/routes/register.tsx`)
- Ensure the Email field is correctly labeled and functional.
- Standardize the layout to match the elegant design system.
- Verify that metadata (full name, address) is correctly saved during sign-up.

### Account Page (`src/routes/_authenticated/account.tsx`)
- Replace the raw JSON textarea for shipping addresses with a structured form (Address, City, Postal Code, Region).
- Add a "Region" dropdown to match the checkout process.
- Sync profile updates with the database schema.

### Admin Dashboard (`src/routes/admin/route.tsx`)
- Adjust padding to prevent the top navigation bar from overlapping the sidebar or content.
- Ensure the sidebar and main content areas have consistent spacing.

### Backend & API
- Update `src/lib/account.functions.ts` to support structured shipping address updates.
- Ensure RLS policies allow users to read their own profile data.

## Technical Details

### Frontend Changes
- **Register Component**: Update state management and form validation for all fields.
- **Account Component**:
  - Implement a multi-field address form.
  - Add `Select` component for South African regions/provinces.
  - Update `updateProfile` call to pass a structured object.
- **Admin Layout**: Change `AdminLayout` padding from `pt-20` to `pt-24` or similar to accommodate the fixed header height.

### Backend Changes
- **Server Functions**: Update `updateProfile` validator in `src/lib/account.functions.ts` to accept the new address structure.
- **Supabase**: Verify that the `profiles` table `shipping_address` column is `jsonb` to handle the structured data.
