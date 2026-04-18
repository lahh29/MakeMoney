import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { IconSend, IconHome, IconShoppingCart, IconPackage, IconChartBar, IconSettings } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { Ventas } from './Ventas';
import { Productos } from './Productos';
import { Resumen } from './Resumen';
import { Configuracion } from './Configuracion';
import { Inicio } from './Inicio';

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
  const [isDark, setIsDark] = useState(false);
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

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark-theme', next);
      return next;
    });
  };

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
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 80 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen}>
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
        marginLeft: (!isMobile && isSidebarOpen) ? '220px' : '0',
        transition: 'margin 0.2s ease',
        width: '100%',
      }}>
        <Header
          isDark={isDark}
          toggleTheme={toggleTheme}
          onLogout={onLogout}
          onNavigate={handleNavigate}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <span style={{ color: 'var(--header-text)', fontWeight: 600, fontSize: '17px' }}>
              {currentLabel}
            </span>
            {headerActions && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                {headerActions}
              </div>
            )}
          </div>
        </Header>

        <Routes>
          <Route index element={<Inicio setHeaderActions={setHeaderActions} />} />
          <Route path="ventas" element={<Ventas setHeaderActions={setHeaderActions} />} />
          <Route path="productos" element={<Productos setHeaderActions={setHeaderActions} />} />
          <Route path="resumen" element={<Resumen setHeaderActions={setHeaderActions} />} />
          <Route path="configuracion" element={<Configuracion setHeaderActions={setHeaderActions} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
