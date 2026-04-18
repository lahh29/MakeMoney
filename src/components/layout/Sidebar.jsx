import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMoon, IconSun, IconLogout, IconUser, IconChevronDown, IconSettings } from '@tabler/icons-react';

const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0.8 },
  visible: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 }
};

export function Sidebar({ children, isOpen = true, isDark, toggleTheme, onLogout, onNavigate, user, role, className = '', style }) {
  const [userOpen, setUserOpen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className={`sidebar ${className}`.trim()}
          style={style}
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
        >
          {/* Brand bar */}
          <div style={{
            height: 'calc(48px + env(safe-area-inset-top))',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            paddingTop: 'env(safe-area-inset-top)',
            paddingLeft: '20px',
            paddingRight: '20px',
            borderBottom: '1px solid var(--border-divider)',
            flexShrink: 0,
          }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--fs-nav)', letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>Vertx Systems</span>
          </div>

          {/* Nav content */}
          <div style={{ padding: '12px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {children}
          </div>

          {/* User section — pinned bottom */}
          <div style={{ borderTop: '1px solid var(--border-divider)', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>

            {/* Action buttons — expand upward */}
            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px 16px', borderBottom: '1px solid var(--border-divider)' }}>
                    <motion.button
                      className="dropdown-icon-action"
                      title={isDark ? 'Tema Claro' : 'Tema Oscuro'}
                      aria-label={isDark ? 'Tema Claro' : 'Tema Oscuro'}
                      onClick={() => { toggleTheme?.(); setUserOpen(false); }}
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
                      onClick={() => { onNavigate?.('/configuracion'); setUserOpen(false); }}
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
                      onClick={() => { setUserOpen(false); onLogout?.(); }}
                      whileHover={{ x: 3, scale: 1.15 }}
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <IconLogout size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User row trigger */}
            <motion.div
              className="sidebar-user-row"
              onClick={() => setUserOpen(prev => !prev)}
              whileHover={{ backgroundColor: 'var(--bg-surface)' }}
              transition={{ duration: 0.15 }}
            >
              <div className="header-avatar">
                <IconUser size={15} />
              </div>
              <div className="header-user-text">
                <span className="header-user-name">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                </span>
                <span className="header-user-email">
                  {role || user?.email || ''}
                </span>
              </div>
              <motion.span
                className="header-chevron"
                style={{ marginLeft: 'auto' }}
                animate={{ rotate: userOpen ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <IconChevronDown size={13} />
              </motion.span>
            </motion.div>

          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
