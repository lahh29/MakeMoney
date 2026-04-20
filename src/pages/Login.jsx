import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconEye, IconEyeOff, IconArrowLeft, IconArrowRight, IconPencil } from '@tabler/icons-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EASE = [0.22, 1, 0.36, 1];

export function Login() {
  const { signIn } = useAuth();
  const [step,        setStep]        = useState(0);   // 0 = email, 1 = password
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const passwordRef = useRef(null);

  // Auto-focus password when entering step 1
  useEffect(() => {
    if (step === 1) {
      const id = setTimeout(() => passwordRef.current?.focus(), 250);
      return () => clearTimeout(id);
    }
  }, [step]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Correo electrónico inválido.');
      return;
    }
    setEmail(trimmed);
    setStep(1);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Ingresa tu contraseña.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : err.message || 'Error al iniciar sesión. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(0);
    setPassword('');
    setError('');
  };

  return (
    <div className="login-wrapper" role="main">
      <a href="#login-email" className="sr-only">Ir al formulario de inicio de sesión</a>

      {/* Hero — panel negro */}
      <section className="login-hero" aria-label="Bienvenida">
        <div className="login-hero__inner">
          <div className="login-hero__logo" aria-hidden="true">V</div>
          <h1 className="login-hero__title">ViñoPlastic</h1>
          <p className="login-hero__caption">
            Planta Querétaro.
          </p>
        </div>
      </section>

      {/* Form — panel claro */}
      <section className="login-form-section" aria-label="Formulario de inicio de sesión">
        <div className="login-form-container">

          <header className="login-form__header">
            <h2 className="login-form-heading">
              {step === 0 ? 'Iniciar sesión' : 'Bienvenido de vuelta'}
            </h2>
            <p className="login-form__sub">
              {step === 0
                ? 'Ingresa tu correo para continuar.'
                : 'Confirma tu contraseña para acceder.'}
            </p>
          </header>

          <AnimatePresence mode="wait" initial={false}>
            {step === 0 ? (
              <motion.form
                key="step-email"
                onSubmit={handleEmailSubmit}
                noValidate
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.32, ease: EASE }}
                className="login-form"
              >
                <div className="form-group">
                  <label htmlFor="login-email" className="form-label">Correo electrónico</label>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="ejemplo@vinoplastic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    aria-required="true"
                    aria-invalid={!!error}
                  />
                </div>

                {error && (
                  <p role="alert" aria-live="polite" className="login-error">{error}</p>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  icon={IconArrowRight}
                  className="login-form__submit"
                >
                  Continuar
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step-password"
                onSubmit={handlePasswordSubmit}
                noValidate
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.32, ease: EASE }}
                className="login-form"
              >
                {/* Email chip — clickable to edit */}
                <button
                  type="button"
                  className="login-email-chip"
                  onClick={handleBack}
                  aria-label={`Cambiar correo. Actual: ${email}`}
                >
                  <span className="login-email-chip__avatar" aria-hidden="true">
                    {email.charAt(0).toUpperCase()}
                  </span>
                  <span className="login-email-chip__email">{email}</span>
                  <IconPencil size={14} className="login-email-chip__edit" />
                </button>

                <div className="form-group">
                  <label htmlFor="login-password" className="form-label">Contraseña</label>
                  <div className="login-password-wrap">
                    <input
                      id="login-password"
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      className="form-input login-password-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      aria-required="true"
                      aria-invalid={!!error}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="login-password-toggle"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p role="alert" aria-live="polite" className="login-error">{error}</p>
                )}

                <div className="login-form__actions">
                  <Button
                    variant="pill"
                    type="button"
                    icon={IconArrowLeft}
                    onClick={handleBack}
                    disabled={loading}
                  >
                    Atrás
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    loading={loading}
                    className="login-form__submit"
                  >
                    Ingresar
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <footer className="login-form__footer">
            <p className="login-footer-text">
              Departamento de Capacitación.
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}

