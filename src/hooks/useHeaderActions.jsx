import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

/**
 * HeaderActions Context.
 * Aísla el estado de los "actions" del header (botones que cada página inyecta)
 * para evitar que un cambio en el header re-renderice toda la Home.
 *
 * Uso en una página:
 *   const setActions = useHeaderActions();
 *   useHeaderActionsEffect(<MyButton />, [dep1]);
 */

const HeaderActionsContext = createContext({
  actions: null,
  setActions: () => {},
});

export function HeaderActionsProvider({ children }) {
  const [actions, setActions] = useState(null);

  const value = useMemo(() => ({ actions, setActions }), [actions]);

  return (
    <HeaderActionsContext.Provider value={value}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

/** Devuelve el setter (estable) para inyectar JSX al header. */
export function useHeaderActions() {
  return useContext(HeaderActionsContext).setActions;
}

/** Devuelve el JSX actual (suscripción reactiva — usa SOLO en el slot del header). */
export function useHeaderActionsValue() {
  return useContext(HeaderActionsContext).actions;
}

/**
 * Helper: monta `actions` JSX en el header durante la vida del componente.
 * Limpia automáticamente al desmontar.
 */
export function useHeaderActionsEffect(jsx, deps = []) {
  const setActions = useHeaderActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableJsx = useMemo(() => jsx, deps);

  useEffect(() => {
    setActions(stableJsx);
    return () => setActions(null);
  }, [stableJsx, setActions]);
}
