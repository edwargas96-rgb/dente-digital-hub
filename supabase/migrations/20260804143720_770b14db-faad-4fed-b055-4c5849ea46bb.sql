
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_lab() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_clinic_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_access_order(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.gen_order_numero() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_lab() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gen_order_numero() TO authenticated;
