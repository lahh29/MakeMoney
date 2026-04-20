import { supabase } from './supabase';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcEstado(comp) {
  if (comp.completados >= comp.meta_total) return 'completado';
  if (!comp.fecha_fin) return comp.estado;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fin = new Date(comp.fecha_fin);
  if (today > fin && comp.completados < comp.meta_total) return 'atrasado';
  return 'en_curso';
}

// ─── Compromisos ─────────────────────────────────────────────────────────────

export async function getCompromisos() {
  const { data, error } = await supabase
    .from('compromisos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  const rows = data ?? [];
  return rows.map(c => ({ ...c, estado: calcEstado(c) }));
}

export async function getCompromiso(id) {
  const { data, error } = await supabase
    .from('compromisos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return { ...data, estado: calcEstado(data) };
}

export async function createCompromiso({
  descripcion, duracion_dias, frecuencia, meta_total, revisor_nombre, fecha_inicio,
  numero_empleado, empleado_nombre, empleado_puesto, empleado_departamento, empleado_turno, empleado_grupo,
}) {
  const { data: { user } } = await supabase.auth.getUser();

  const fin = new Date(fecha_inicio || new Date());
  fin.setDate(fin.getDate() + (Number(duracion_dias) || 30));
  const fecha_fin = fin.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('compromisos')
    .insert({
      descripcion,
      duracion_dias: Number(duracion_dias),
      frecuencia,
      meta_total: Number(meta_total),
      revisor_nombre: revisor_nombre || null,
      responsable_id: user.id,
      fecha_inicio: fecha_inicio || new Date().toISOString().split('T')[0],
      fecha_fin,
      estado: 'en_curso',
      numero_empleado:        numero_empleado        || null,
      empleado_nombre:        empleado_nombre        || null,
      empleado_puesto:        empleado_puesto        || null,
      empleado_departamento:  empleado_departamento  || null,
      empleado_turno:         empleado_turno         || null,
      empleado_grupo:         empleado_grupo         || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCompromiso(id, updates) {
  const { data, error } = await supabase
    .from('compromisos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCompromiso(id) {
  const { error } = await supabase
    .from('compromisos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── Registros ───────────────────────────────────────────────────────────────

export async function getRegistros(compromisoId) {
  const { data, error } = await supabase
    .from('registros_compromiso')
    .select('*')
    .eq('compromiso_id', compromisoId)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addRegistro({ compromiso_id, nota, fecha }) {
  const { data, error } = await supabase
    .from('registros_compromiso')
    .insert({
      compromiso_id,
      nota: nota || null,
      fecha: fecha || new Date().toISOString().split('T')[0],
      completado: true,
    })
    .select()
    .single();

  if (error) throw error;

  // Increment completados on the parent compromiso
  const comp = await getCompromiso(compromiso_id);
  const nuevosCompletados = comp.completados + 1;
  const nuevoEstado = calcEstado({ ...comp, completados: nuevosCompletados });

  await supabase
    .from('compromisos')
    .update({ completados: nuevosCompletados, estado: nuevoEstado })
    .eq('id', compromiso_id);

  return data;
}

// ─── Evidencias ──────────────────────────────────────────────────────────────

export async function addEvidencia({ compromiso_id, registro_id, tipo, contenido, url }) {
  const { data, error } = await supabase
    .from('evidencias')
    .insert({ compromiso_id, registro_id: registro_id || null, tipo, contenido: contenido || null, url: url || null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEvidencias(compromisoId) {
  const { data, error } = await supabase
    .from('evidencias')
    .select('*')
    .eq('compromiso_id', compromisoId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
