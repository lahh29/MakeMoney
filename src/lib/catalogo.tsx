// ─── Tipos / Interfaces ────────────────────────────────────────────────────────

export interface Empleado {
  numero_empleado: string;   // "EMP-001"   ← clave primaria en Supabase
  nombre:          string;   // "Juan López"
  puesto:          string;   // "Asesor de Ventas"
  departamento:    string;   // "Ventas"
  turno:           Turno;   // "Matutino" | "Vespertino" | "Nocturno"
  grupo:           Grupo;   // "A" | "B" | "C" ...
  activo?:         boolean;  // true = aparece en búsquedas
}

// ─── Constantes de catálogo (no cambian) ──────────────────────────────────────

export const TURNOS = ['1', '2', '3', '4'] as const;
export type Turno = typeof TURNOS[number];

export const GRUPOS = ['A', 'B', 'C', 'D'] as const;
export type Grupo = typeof GRUPOS[number];

export const FRECUENCIAS = ['Diaria', 'Semanal', 'Quincenal', 'Mensual'] as const;
export type Frecuencia = typeof FRECUENCIAS[number];

export const ESTADOS_COMPROMISO = ['en_curso', 'completado', 'atrasado'] as const;
export type EstadoCompromiso = typeof ESTADOS_COMPROMISO[number];