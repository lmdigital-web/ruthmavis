# Plan: Fix Image Upload and Display

The user is experiencing issues where images are not uploading (error message) and existing images are not displaying. I've identified that the `product-images` storage bucket is marked as private, and there may be conflicting or missing RLS policies for admin uploads and public viewing.

## User Review Required
> [!IMPORTANT]
> I am applying a fix to your database storage settings to ensure images can be uploaded and viewed publicly. This involves setting the 'product-images' folder to public and updating its security rules.

## Proposed Changes

### Database & Storage
- Create a migration to set the `product-images` storage bucket to **Public**.
- Simplify and fix Storage RLS policies:
  - **SELECT**: Allow anyone (anonymous and logged-in users) to view images.
  - **INSERT/UPDATE/DELETE**: Allow only authenticated admins to manage images.

### Frontend Components
- Update `src/components/MultiImageUpload.tsx`:
  - Improve error logging to capture specific Supabase error codes.
  - Add explicit `upsert: false` and `cacheControl` to upload options.
  - Ensure public URLs are correctly generated after upload.

## Technical Details
- The migration will target the `storage.buckets` and `storage.objects` tables.
- Frontend changes will use the standard `@supabase/supabase-js` storage API.
- Error handling in `MultiImageUpload` will now log full error objects to the browser console for easier debugging if issues persist.
