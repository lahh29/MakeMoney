import React, { useEffect } from 'react';
import { Box } from '../components/ui/Box';

export function Inicio({ setHeaderActions }) {
  useEffect(() => {
    setHeaderActions?.(null);
  }, []);

  return (
    <Box style={{ padding: '40px 24px', maxWidth: '100%' }}>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px' }}>
        Sistema de gestión inteligente de postventa. Selecciona una opción del menú lateral para comenzar.
      </p>
    </Box>
  );
}
