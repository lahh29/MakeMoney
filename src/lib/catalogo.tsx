// ─── Constantes de catálogo (compartidas entre módulos) ──────────────────────

export const TURNOS = ['1', '2', '3', '4'] as const;
export type Turno = typeof TURNOS[number];

export const GRUPOS = ['A', 'B', 'C', 'D'] as const;
export type Grupo = typeof GRUPOS[number];
