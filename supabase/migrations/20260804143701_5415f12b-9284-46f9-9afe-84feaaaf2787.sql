
CREATE TYPE public.app_role AS ENUM ('clinica','laboratorio');
CREATE TYPE public.order_status AS ENUM ('Recebida','Em análise','Em produção','Em prova','Pronta','Enviada/Entregue');

CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  responsavel text,
  telefone text,
  email text,
  endereco text,
  documento text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT ALL ON public.clinics TO service_role;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo text NOT NULL DEFAULT '',
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_lab()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'laboratorio')
$$;

CREATE OR REPLACE FUNCTION public.my_clinic_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
$$;

-- clinics policies
CREATE POLICY "lab manages clinics" ON public.clinics FOR ALL TO authenticated
  USING (public.is_lab()) WITH CHECK (public.is_lab());
CREATE POLICY "clinic reads own clinic" ON public.clinics FOR SELECT TO authenticated
  USING (id = public.my_clinic_id());

-- profiles policies
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_lab());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_lab()) WITH CHECK (id = auth.uid() OR public.is_lab());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_lab());

-- user_roles policies
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_lab());

-- catalogs
CREATE TABLE public.item_types (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), nome text NOT NULL, ativo boolean NOT NULL DEFAULT true);
CREATE TABLE public.materials (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), nome text NOT NULL, ativo boolean NOT NULL DEFAULT true);
CREATE TABLE public.implant_systems (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), nome text NOT NULL, ativo boolean NOT NULL DEFAULT true);
CREATE TABLE public.scanbodies (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), nome text NOT NULL, ativo boolean NOT NULL DEFAULT true);
CREATE TABLE public.tooth_shades (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), nome text NOT NULL, ativo boolean NOT NULL DEFAULT true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_types, public.materials, public.implant_systems, public.scanbodies, public.tooth_shades TO authenticated;
GRANT ALL ON public.item_types, public.materials, public.implant_systems, public.scanbodies, public.tooth_shades TO service_role;
ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implant_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanbodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tooth_shades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read item_types" ON public.item_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab manages item_types" ON public.item_types FOR ALL TO authenticated USING (public.is_lab()) WITH CHECK (public.is_lab());
CREATE POLICY "read materials" ON public.materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab manages materials" ON public.materials FOR ALL TO authenticated USING (public.is_lab()) WITH CHECK (public.is_lab());
CREATE POLICY "read implant_systems" ON public.implant_systems FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab manages implant_systems" ON public.implant_systems FOR ALL TO authenticated USING (public.is_lab()) WITH CHECK (public.is_lab());
CREATE POLICY "read scanbodies" ON public.scanbodies FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab manages scanbodies" ON public.scanbodies FOR ALL TO authenticated USING (public.is_lab()) WITH CHECK (public.is_lab());
CREATE POLICY "read tooth_shades" ON public.tooth_shades FOR SELECT TO authenticated USING (true);
CREATE POLICY "lab manages tooth_shades" ON public.tooth_shades FOR ALL TO authenticated USING (public.is_lab()) WITH CHECK (public.is_lab());

-- orders
CREATE SEQUENCE public.order_numero_seq;
CREATE OR REPLACE FUNCTION public.gen_order_numero()
RETURNS text LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT 'OS-' || lpad(nextval('public.order_numero_seq')::text, 4, '0')
$$;
GRANT USAGE ON SEQUENCE public.order_numero_seq TO authenticated, service_role;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE DEFAULT public.gen_order_numero(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente text NOT NULL,
  dentista text,
  item text,
  elementos integer[] NOT NULL DEFAULT '{}',
  sob_implante boolean NOT NULL DEFAULT false,
  implante text,
  scanbody text,
  material text,
  cor text,
  data_entrega date NOT NULL,
  observacoes text,
  status public.order_status NOT NULL DEFAULT 'Recebida',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lab manages orders" ON public.orders FOR ALL TO authenticated
  USING (public.is_lab()) WITH CHECK (public.is_lab());
CREATE POLICY "clinic reads own orders" ON public.orders FOR SELECT TO authenticated
  USING (clinic_id = public.my_clinic_id());
CREATE POLICY "clinic creates own orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.my_clinic_id() AND created_by = auth.uid());

CREATE TABLE public.order_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('arquivo','foto')),
  storage_path text NOT NULL,
  nome_arquivo text NOT NULL,
  tamanho bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_files TO authenticated;
GRANT ALL ON public.order_files TO service_role;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_order(_order_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_lab() OR EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = _order_id AND o.clinic_id = public.my_clinic_id()
  )
$$;

CREATE POLICY "order files access" ON public.order_files FOR SELECT TO authenticated
  USING (public.can_access_order(order_id));
CREATE POLICY "order files insert" ON public.order_files FOR INSERT TO authenticated
  WITH CHECK (public.can_access_order(order_id));
CREATE POLICY "order files delete" ON public.order_files FOR DELETE TO authenticated
  USING (public.can_access_order(order_id));

CREATE TABLE public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.order_status,
  comentario text,
  autor text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order events access" ON public.order_events FOR SELECT TO authenticated
  USING (public.can_access_order(order_id));
CREATE POLICY "order events insert" ON public.order_events FOR INSERT TO authenticated
  WITH CHECK (public.can_access_order(order_id));

-- profile auto-create
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, clinic_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    NULLIF(NEW.raw_user_meta_data->>'clinic_id','')::uuid
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'clinica'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.item_types (nome) VALUES ('Coroa'),('Ponte'),('Faceta'),('Provisório'),('Placa'),('Protocolo'),('Inlay/Onlay');
INSERT INTO public.materials (nome) VALUES ('Zircônia'),('Dissilicato'),('Metalocerâmica'),('PMMA');
INSERT INTO public.implant_systems (nome) VALUES ('Neodent'),('Straumann'),('Nobel Biocare'),('Zimmer'),('Conexão'),('S.I.N.');
INSERT INTO public.scanbodies (nome) VALUES ('Scanbody Neodent'),('Scanbody Straumann'),('Scanbody Nobel'),('Scanbody genérico');
INSERT INTO public.tooth_shades (nome) VALUES ('A1'),('A2'),('A3'),('A3.5'),('B1'),('B2'),('C1'),('D2');
