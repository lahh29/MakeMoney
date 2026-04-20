import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { NotificationProvider } from './components/ui/Notification';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppearanceProvider } from './hooks/useAppearance';
import { PlaneTransition } from './components/ui/PlaneTransition';

function AppContent() {
  const { isAuthenticated, loading, signOut } = useAuth();
  const [showPlane, setShowPlane] = useState(false);
  const transitionDir = useRef(null);
  const prevAuth = useRef(null);
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;

  // Detect login → trigger plane
  useEffect(() => {
    if (loading) return;
    if (prevAuth.current === null) {
      prevAuth.current = isAuthenticated;
      return;
    }
    if (isAuthenticated && !prevAuth.current) {
      transitionDir.current = 'login';
      setShowPlane(true);
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated, loading]);

  // Logout — plane plays over auth state change
  const handleLogout = useCallback(() => {
    transitionDir.current = 'logout';
    setShowPlane(true);
    signOutRef.current().catch(e => console.error('Logout error:', e));
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setShowPlane(false);
    transitionDir.current = null;
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-text)',
        fontSize: 'var(--fs-lg)'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <>
      <PlaneTransition isActive={showPlane} direction={transitionDir.current} onComplete={handleTransitionComplete} />
      <Routes>
        {isAuthenticated ? (
          <Route path="/*" element={<Home onLogout={handleLogout} />} />
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppearanceProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
