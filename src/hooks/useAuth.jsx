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

  const value = {
    user,
    role,
    loading,
    signIn,
    signOut,
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
