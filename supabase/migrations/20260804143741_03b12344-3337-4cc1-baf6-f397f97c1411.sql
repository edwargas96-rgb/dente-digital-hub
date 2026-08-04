
CREATE POLICY "ordens read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ordens' AND public.can_access_order(((storage.foldername(name))[1])::uuid));

CREATE POLICY "ordens insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ordens' AND public.can_access_order(((storage.foldername(name))[1])::uuid));

CREATE POLICY "ordens delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ordens' AND public.can_access_order(((storage.foldername(name))[1])::uuid));
