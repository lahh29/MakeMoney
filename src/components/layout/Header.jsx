import React from 'react';
import { motion } from 'framer-motion';
import { IconMoon, IconSun, IconLogout, IconUser, IconChevronDown, IconSettings } from '@tabler/icons-react';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';

export function Header({ children, isDark, toggleTheme, onLogout, onNavigate, className = '', ...props }) {
  return (
    <header className={`header ${className}`.trim()} {...props}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 20px' }}>

        {/* Sección Izquierda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {children}
        </div>

        {/* Sección Derecha — Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <motion.div
              className="header-user-pill"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <div className="header-avatar">
                <IconUser size={15} />
              </div>
              <div className="header-user-text">
                <span className="header-user-name">Administrador</span>
                <span className="header-user-email">@admin_post</span>
              </div>
              <motion.span className="header-chevron">
                <IconChevronDown size={13} />
              </motion.span>
            </motion.div>
          }
        >
          {(close, isOpen) => (
            <>
              {/* Info usuario */}
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--apple-blue), #40a9ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,113,227,0.35)'
                }}>
                  <IconUser size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Administrador</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>admin@postsell.com</span>
                </div>
              </div>
              <DropdownDivider />
              {/* Acciones — iconos horizontales */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px 16px' }}>
                <motion.button
                  className="dropdown-icon-action"
                  title={isDark ? 'Tema Claro' : 'Tema Oscuro'}
                  aria-label={isDark ? 'Tema Claro' : 'Tema Oscuro'}
                  onClick={() => { toggleTheme(); close(); }}
                  whileHover={{ rotate: 180, scale: 1.15 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
                </motion.button>
                <motion.button
                  className="dropdown-icon-action"
                  title="Configuración"
                  aria-label="Configuración"
                  onClick={() => { if (onNavigate) onNavigate('/configuracion'); close(); }}
                  whileHover={{ rotate: 45, scale: 1.15 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <IconSettings size={18} />
                </motion.button>
                <motion.button
                  className="dropdown-icon-action dropdown-icon-action--danger"
                  title="Cerrar Sesión"
                  aria-label="Cerrar Sesión"
                  onClick={() => { close(); if (onLogout) onLogout(); }}
                  whileHover={{ x: 3, scale: 1.15 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <IconLogout size={18} />
                </motion.button>
              </div>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
