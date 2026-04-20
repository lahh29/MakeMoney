import { supabase } from './supabase';

/**
 * Buscar empleado por número exacto.
 * Returns empleado object or null.
 */
export async function getEmpleado(numero_empleado) {
  const { data, error } = await supabase
    .from('empleados')
    .select('numero_empleado, nombre, puesto, departamento, turno, grupo')
    .eq('numero_empleado', numero_empleado.trim())
    .eq('activo', true)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

/**
 * Buscar empleados por número parcial o nombre.
 * Useful for autocomplete.
 */
export async function searchEmpleados(query) {
  const q = query.trim();
  if (!q) return [];

  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .eq('activo', true)
    .or(`numero_empleado.ilike.${q}%,nombre.ilike.%${q}%`)
    .order('numero_empleado')
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

/**
 * Obtener todos los grupos únicos registrados.
 */
export async function getGrupos() {
  const { data, error } = await supabase
    .from('empleados')
    .select('grupo')
    .eq('activo', true)
    .order('grupo');

  if (error) throw error;
  const unique = [...new Set(data.map(r => r.grupo).filter(Boolean))];
  return unique;
}

/**
 * Actualizar turno y/o grupo de un empleado.
 * Solo gerente/supervisor según RLS.
 */
export async function updateEmpleadoTurnoGrupo(numero_empleado, { turno, grupo }) {
  const updates = {};
  if (turno !== undefined) updates.turno = turno;
  if (grupo !== undefined) updates.grupo = grupo;

  const { data, error } = await supabase
    .from('empleados')
    .update(updates)
    .eq('numero_empleado', numero_empleado)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Carga masiva de empleados desde JSON (temporal).
 * Upsert por numero_empleado. Retorna inserted y total.
 */
export async function bulkCreateEmpleados(empleados) {
  const rows = empleados.map(e => ({
    numero_empleado: String(e.numero_empleado ?? '').trim(),
    nombre:          String(e.nombre ?? '').trim(),
    puesto:          String(e.puesto ?? '').trim(),
    departamento:    String(e.departamento ?? '').trim(),
    turno:           String(e.turno ?? '1').trim(),
    grupo:           String(e.grupo ?? 'A').trim(),
    activo:          e.activo !== false,
  })).filter(r => r.numero_empleado && r.nombre);

  if (rows.length === 0) throw new Error('Ningún registro válido en el JSON. Verifica que los campos "numero_empleado" y "nombre" existan.');

  const { data, error } = await supabase
    .from('empleados')
    .upsert(rows, { onConflict: 'numero_empleado' })
    .select('numero_empleado');

  if (error) throw error;
  return { inserted: data?.length ?? 0, total: rows.length };
}
