import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { IconSend, IconHome, IconShoppingCart, IconPackage, IconChartBar, IconSettings, IconUser, IconMoon, IconSun, IconLogout } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { Popover } from '../components/ui/Popover';
import { useAppearance } from '../hooks/useAppearance';
import { useAuth } from '../hooks/useAuth';

const Ventas = lazy(() => import('./Ventas').then(m => ({ default: m.Ventas })));
const Productos = lazy(() => import('./Productos').then(m => ({ default: m.Productos })));
const Resumen = lazy(() => import('./Resumen').then(m => ({ default: m.Resumen })));
const Configuracion = lazy(() => import('./Configuracion').then(m => ({ default: m.Configuracion })));
const Inicio = lazy(() => import('./Inicio').then(m => ({ default: m.Inicio })));

const PAGES = {
  '/':              { label: 'Inicio',        icon: IconHome        },
  '/ventas':        { label: 'Ventas',         icon: IconShoppingCart },
  '/productos':     { label: 'Productos',      icon: IconPackage      },
  '/resumen':       { label: 'Resumen',        icon: IconChartBar     },
  '/configuracion': { label: 'Configuración',  icon: IconSettings     },
};

export function Home({ onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDark, toggleDark } = useAppearance();
  const { user } = useAuth();
  const [headerActions, setHeaderActions] = useState(null);

  // Responsive sidebar
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentLabel = PAGES[pathname]?.label ?? PAGES['/'].label;

  useEffect(() => {
    document.title = currentLabel;
  }, [currentLabel]);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Overlay móvil */}
      {isMobile && isSidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg-overlay)', zIndex: 105 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
      >
        <nav style={{ padding: '12px 12px 24px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Object.entries(PAGES)
              .filter(([path]) => path !== '/configuracion')
              .map(([path, { label, icon: Icon }]) => {
                const isActive = pathname === path;
                return (
                  <motion.li
                    key={path}
                    onClick={() => handleNavigate(path)}
                    className={`nav-pill${isActive ? ' nav-pill--active' : ''}`}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    style={{ position: 'relative', cursor: 'pointer', listStyle: 'none' }}
                  >
                    {isActive && (
                      <motion.span
                        className="nav-pill__bg"
                        layoutId="active-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="nav-pill__content">
                      <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{label}</span>
                    </span>
                  </motion.li>
                );
              })}
          </ul>
        </nav>
      </Sidebar>

      <main style={{
        flex: 1,
        minWidth: 0,
        marginLeft: (!isMobile && isSidebarOpen) ? '220px' : '0',
        transition: 'margin 0.2s ease',
      }}>
        <Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              animate={{ rotate: isSidebarOpen ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', padding: 0,
                color: 'var(--header-text)',
              }}
              aria-label="Toggle Sidebar"
            >
              <IconSend size={18} />
            </motion.button>
            <span style={{ color: 'var(--header-text)', fontWeight: 600, fontSize: 'var(--fs-lg)' }}>
              {currentLabel}
            </span>
            {headerActions && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                {headerActions}
              </div>
            )}

            {/* User pill — right side */}
            <div style={{ marginLeft: 'auto' }}>
              <Popover
                position="bottom"
                align="end"
                trigger={
                  <button className="header-user-pill" type="button">
                    <span className="header-avatar">
                      {user?.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        <IconUser size={14} />
                      )}
                    </span>
                  </button>
                }
                content={
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <motion.button
                      className="dropdown-icon-action"
                      title={isDark ? 'Tema Claro' : 'Tema Oscuro'}
                      aria-label={isDark ? 'Tema Claro' : 'Tema Oscuro'}
                      onClick={() => toggleDark?.()}
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
                      onClick={() => handleNavigate('/configuracion')}
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
                      onClick={() => onLogout?.()}
                      whileHover={{ x: 3, scale: 1.15 }}
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <IconLogout size={18} />
                    </motion.button>
                  </div>
                }
              />
            </div>
          </div>
        </Header>

        <Suspense fallback={
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '200px', color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-text)', fontSize: 'var(--fs-body)'
          }}>
            Cargando...
          </div>
        }>
          <Routes>
            <Route index element={<Inicio setHeaderActions={setHeaderActions} />} />
            <Route path="ventas" element={<Ventas setHeaderActions={setHeaderActions} />} />
            <Route path="productos" element={<Productos setHeaderActions={setHeaderActions} />} />
            <Route path="resumen" element={<Resumen setHeaderActions={setHeaderActions} />} />
            <Route path="configuracion" element={<Configuracion setHeaderActions={setHeaderActions} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
