-- ============================================================================
-- PostSell: Sistema de Compromisos — Empleados
-- Run in Supabase SQL Editor AFTER supabase_migration_compromisos.sql
-- ============================================================================

-- 1. Tabla empleados
--    numero_empleado, nombre, puesto, departamento: datos estáticos
--    turno, grupo: editables por gerente/supervisor
CREATE TABLE IF NOT EXISTS public.empleados (
  numero_empleado TEXT        PRIMARY KEY,
  nombre          TEXT        NOT NULL,
  puesto          TEXT        NOT NULL DEFAULT '',
  departamento    TEXT        NOT NULL DEFAULT '',
  turno           TEXT        NOT NULL DEFAULT 'Matutino',
  grupo           TEXT        NOT NULL DEFAULT 'A',
  activo          BOOLEAN     NOT NULL DEFAULT true,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RLS empleados
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados ven empleados
CREATE POLICY "empleados_select"
  ON public.empleados FOR SELECT
  TO authenticated
  USING (true);

-- Solo gerente/supervisor pueden insertar
CREATE POLICY "empleados_insert"
  ON public.empleados FOR INSERT
  TO authenticated
  WITH CHECK (public.auth_user_role() IN ('admin', 'gerente', 'supervisor'));

-- Solo gerente/supervisor pueden actualizar (turno, grupo)
CREATE POLICY "empleados_update"
  ON public.empleados FOR UPDATE
  TO authenticated
  USING (public.auth_user_role() IN ('admin', 'gerente', 'supervisor'));

-- 3. Trigger updated_at para empleados
CREATE OR REPLACE FUNCTION public.empleados_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS empleados_updated_at ON public.empleados;
CREATE TRIGGER empleados_updated_at
  BEFORE UPDATE ON public.empleados
  FOR EACH ROW EXECUTE FUNCTION public.empleados_set_updated_at();

-- 4. Añadir columnas de empleado a compromisos
--    (snapshot en el momento de crear — no FK para evitar restricciones si empleado cambia)
ALTER TABLE public.compromisos
  ADD COLUMN IF NOT EXISTS numero_empleado    TEXT,
  ADD COLUMN IF NOT EXISTS empleado_nombre    TEXT,
  ADD COLUMN IF NOT EXISTS empleado_puesto    TEXT,
  ADD COLUMN IF NOT EXISTS empleado_departamento TEXT,
  ADD COLUMN IF NOT EXISTS empleado_turno     TEXT,
  ADD COLUMN IF NOT EXISTS empleado_grupo     TEXT;

-- Índice para filtrar por grupo
CREATE INDEX IF NOT EXISTS compromisos_empleado_grupo_idx
  ON public.compromisos (empleado_grupo);

CREATE INDEX IF NOT EXISTS compromisos_numero_empleado_idx
  ON public.compromisos (numero_empleado);
