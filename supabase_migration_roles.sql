-- ============================================================================
-- PostSell: Sistema de Compromisos — Roles de usuario
-- Run FIRST, before supabase_migration_compromisos.sql
-- ============================================================================

-- 1. Tabla user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('admin', 'gerente', 'supervisor', 'auxiliar')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 2. Índice para lookups por user_id (usado en cada policy)
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);

-- 3. RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función SECURITY DEFINER: lee user_roles sin activar RLS (evita recursión infinita)
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Cada usuario ve solo su(s) propio(s) rol(es)
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Solo admin puede ver todos los roles
CREATE POLICY "user_roles_select_admin"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.auth_user_role() = 'admin');

-- Solo admin puede insertar / actualizar / eliminar roles
CREATE POLICY "user_roles_insert_admin"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.auth_user_role() = 'admin');

CREATE POLICY "user_roles_update_admin"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.auth_user_role() = 'admin');

CREATE POLICY "user_roles_delete_admin"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.auth_user_role() = 'admin');

-- ============================================================================
-- PASO MANUAL: Asignar rol al primer administrador
-- Sustituye '<UUID-DEL-USUARIO>' con el auth.uid() real del administrador.
-- Puedes obtenerlo en: Supabase Dashboard → Authentication → Users
-- ============================================================================
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<UUID-DEL-USUARIO>', 'admin');

-- Roles disponibles: admin, gerente, supervisor, auxiliar

-- Ejemplo asignar gerente:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<UUID-GERENTE>', 'gerente');

-- Ejemplo asignar supervisor:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<UUID-SUPERVISOR>', 'supervisor');

-- ============================================================================
-- Si la tabla ya existía con constraint anterior, ejecuta esto primero:
-- ============================================================================
-- ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_role_check;
-- ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check
--   CHECK (role IN ('admin', 'gerente', 'supervisor', 'auxiliar'));
