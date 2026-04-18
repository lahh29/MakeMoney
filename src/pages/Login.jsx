import React, { useState } from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : err.message || 'Error al iniciar sesión. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" role="main">
      <a href="#login-email" className="sr-only">Ir al formulario de inicio de sesión</a>

      {/* Hero Section */}
      <section className="login-hero" aria-label="Bienvenida">
        <img
          src="/favicon.svg"
          alt="Vertx Systems"
          className="login-logo"
          aria-hidden="true"
          width="80"
          height="80"
        />
        <h1 className="login-title">Vertx Systems</h1>
        <p className="login-subtitle">Sistema para el control de ventas</p>
      </section>

      {/* Form Section */}
      <section className="login-form-section" aria-label="Formulario de inicio de sesión">
        <div className="login-form-container">
          <h2 className="login-form-heading">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="ejemplo@postsell.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-required="true"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', display: 'flex',
                    alignItems: 'center', padding: '2px',
                  }}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" aria-live="polite" className="login-error" style={{ marginTop: '8px' }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '17px',
                  borderRadius: 'var(--radius-md)',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Ingresando...' : 'Continuar'}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
