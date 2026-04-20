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
 * Crear un empleado individual.
 * Insert directo. Lanza error si numero_empleado ya existe.
 */
export async function createEmpleado(empleado) {
  const row = {
    numero_empleado: String(empleado.numero_empleado ?? '').trim(),
    nombre:          String(empleado.nombre ?? '').trim(),
    puesto:          String(empleado.puesto ?? '').trim(),
    departamento:    String(empleado.departamento ?? '').trim(),
    turno:           String(empleado.turno ?? '1').trim(),
    grupo:           String(empleado.grupo ?? 'A').trim(),
    activo:          true,
  };

  if (!row.numero_empleado || !row.nombre) {
    throw new Error('Número de empleado y nombre son obligatorios.');
  }

  const { data, error } = await supabase
    .from('empleados')
    .insert(row)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`El número de empleado "${row.numero_empleado}" ya existe.`);
    }
    throw error;
  }

  return data;
}
