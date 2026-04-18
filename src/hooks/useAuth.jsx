import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching role:', error.message);
      setRole(null);
      return null;
    }

    setRole(data.role);
    return data.role;
  }, []);

  useEffect(() => {
    // Safety timeout — never stay on "Cargando..." forever
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchRole(session.user.id);
      }
      setLoading(false);
      clearTimeout(safetyTimer);
    }).catch(() => {
      setLoading(false);
      clearTimeout(safetyTimer);
    });

    // Listen auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchRole(session.user.id);
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    setUser(null);
    setRole(null);
    await supabase.auth.signOut({ scope: 'local' }).catch(console.error);
  };

  // Direct REST helper — bypass all SDK auth methods (getSession/updateUser deadlock)
  const _getToken = () => {
    try {
      const key = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
      const stored = JSON.parse(localStorage.getItem(key));
      return stored?.access_token ?? null;
    } catch { return null; }
  };

  const _authPut = async (body) => {
    const token = _getToken();
    if (!token) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.msg || err.message || `Error ${res.status}`);
    }
    return res.json();
  };

  const updateProfile = async (metadata) => {
    const result = await _authPut({ data: metadata });
    if (result) setUser(prev => ({ ...prev, ...result, user_metadata: { ...prev?.user_metadata, ...metadata } }));
  };

  const updatePassword = async (newPassword) => {
    await _authPut({ password: newPassword });
  };

  const value = {
    user,
    role,
    loading,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    isAdmin: role === 'administrador',
    isVendedor: role === 'vendedor',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
