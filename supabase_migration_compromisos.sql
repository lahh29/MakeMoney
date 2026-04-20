-- ============================================================================
-- PostSell → Sistema de Compromisos
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================================

-- 1. Compromisos
CREATE TABLE IF NOT EXISTS public.compromisos (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion     TEXT        NOT NULL,
  duracion_dias   INTEGER     NOT NULL DEFAULT 30,
  frecuencia      TEXT        NOT NULL CHECK (frecuencia IN ('diaria', 'semanal', 'mensual')),
  meta_total      INTEGER     NOT NULL,
  completados     INTEGER     NOT NULL DEFAULT 0,
  responsable_id  UUID        NOT NULL REFERENCES auth.users(id),
  revisor_nombre  TEXT,
  estado          TEXT        NOT NULL DEFAULT 'en_curso'
                              CHECK (estado IN ('en_curso', 'completado', 'atrasado')),
  fecha_inicio    DATE        NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin       DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Registros diarios
CREATE TABLE IF NOT EXISTS public.registros_compromiso (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  compromiso_id   UUID        NOT NULL REFERENCES public.compromisos(id) ON DELETE CASCADE,
  fecha           DATE        NOT NULL DEFAULT CURRENT_DATE,
  completado      BOOLEAN     NOT NULL DEFAULT true,
  nota            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Evidencias
CREATE TABLE IF NOT EXISTS public.evidencias (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  compromiso_id   UUID        NOT NULL REFERENCES public.compromisos(id) ON DELETE CASCADE,
  registro_id     UUID        REFERENCES public.registros_compromiso(id) ON DELETE CASCADE,
  tipo            TEXT        NOT NULL CHECK (tipo IN ('foto', 'nota')),
  contenido       TEXT,
  url             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RLS
ALTER TABLE public.compromisos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_compromiso  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencias            ENABLE ROW LEVEL SECURITY;

-- 5. Compromisos policies
CREATE POLICY "compromisos_select"
  ON public.compromisos FOR SELECT
  USING (
    auth.uid() = responsable_id
    OR public.auth_user_role() IN ('gerente', 'supervisor')
  );

CREATE POLICY "compromisos_insert"
  ON public.compromisos FOR INSERT
  WITH CHECK (auth.uid() = responsable_id);

CREATE POLICY "compromisos_update"
  ON public.compromisos FOR UPDATE
  USING (
    auth.uid() = responsable_id
    OR public.auth_user_role() IN ('gerente', 'supervisor')
  );

CREATE POLICY "compromisos_delete"
  ON public.compromisos FOR DELETE
  USING (auth.uid() = responsable_id);

-- 6. Registros policies
CREATE POLICY "registros_select"
  ON public.registros_compromiso FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.compromisos c
      WHERE c.id = compromiso_id
        AND (
          c.responsable_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('gerente', 'supervisor')
          )
        )
    )
  );

CREATE POLICY "registros_insert"
  ON public.registros_compromiso FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.compromisos c
      WHERE c.id = compromiso_id AND c.responsable_id = auth.uid()
    )
  );

-- 7. Evidencias policies
CREATE POLICY "evidencias_select"
  ON public.evidencias FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.compromisos c
      WHERE c.id = compromiso_id
        AND (
          c.responsable_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('gerente', 'supervisor')
          )
        )
    )
  );

CREATE POLICY "evidencias_insert"
  ON public.evidencias FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.compromisos c
      WHERE c.id = compromiso_id AND c.responsable_id = auth.uid()
    )
  );

-- 8. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.compromisos_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS compromisos_updated_at ON public.compromisos;
CREATE TRIGGER compromisos_updated_at
  BEFORE UPDATE ON public.compromisos
  FOR EACH ROW EXECUTE FUNCTION public.compromisos_set_updated_at();
