-- O laboratório (LAB PIGATTO) apenas analisa as ordens: pode ver, atualizar o
-- status e remover, mas NÃO pode criar novas ordens. A abertura de ordens é
-- exclusiva das clínicas/dentistas.
--
-- A política anterior "lab manages orders" (FOR ALL) permitia INSERT pelo lab.
-- Trocamos por políticas específicas de SELECT/UPDATE/DELETE, sem INSERT.

DROP POLICY IF EXISTS "lab manages orders" ON public.orders;

CREATE POLICY "lab reads orders" ON public.orders FOR SELECT TO authenticated
  USING (public.is_lab());

CREATE POLICY "lab updates orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.is_lab()) WITH CHECK (public.is_lab());

CREATE POLICY "lab deletes orders" ON public.orders FOR DELETE TO authenticated
  USING (public.is_lab());
