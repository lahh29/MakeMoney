import React, { useEffect } from 'react';
import { Box } from '../components/ui/Box';

export function Configuracion({ setHeaderActions }) {
  useEffect(() => {
    setHeaderActions?.(null);
    return () => setHeaderActions?.(null);
  }, []);

  return (
    <Box style={{ padding: '24px', maxWidth: '100%' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Módulo de configuración en construcción.</p>
    </Box>
  );
}
