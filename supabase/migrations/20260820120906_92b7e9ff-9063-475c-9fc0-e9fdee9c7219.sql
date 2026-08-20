
-- Grant access to storage tables for authenticated users to see buckets
GRANT SELECT ON storage.buckets TO authenticated;
GRANT SELECT ON storage.objects TO authenticated;
