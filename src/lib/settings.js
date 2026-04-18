import { supabase } from './supabase';

/**
 * Fetch user_settings row for given user.
 * Returns { appearance, empresa } or null.
 */
export async function fetchUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('appearance, empresa')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('[settings] fetch error:', error.message);
    return null;
  }
  return data ?? null;
}

/**
 * Upsert only the appearance JSONB column.
 * PostgREST's ON CONFLICT only updates columns present in payload,
 * so empresa is never overwritten.
 */
export async function saveAppearance(userId, appearance) {
  const { error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, appearance, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  if (error) console.error('[settings] save appearance error:', error.message);
  return !error;
}

/**
 * Upsert only the empresa JSONB column.
 */
export async function saveEmpresa(userId, empresa) {
  const { error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, empresa, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  if (error) console.error('[settings] save empresa error:', error.message);
  return !error;
}
