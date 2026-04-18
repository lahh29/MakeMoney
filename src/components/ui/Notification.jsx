import React, { useEffect, useCallback, createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCircleCheck, IconAlertCircle, IconTrash, IconInfoCircle } from '@tabler/icons-react';

const NotificationContext = createContext(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be inside NotificationProvider');
  return ctx;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const add = useCallback((n) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, ...n }]);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = {
    success:       (message)            => add({ type: 'success', message }),
    error:         (message)            => add({ type: 'error',   message }),
    info:          (message)            => add({ type: 'info',    message }),
    confirm:       (message, onConfirm) => add({ type: 'confirm', message, onConfirm }),
    deleteConfirm: (message, onDelete)  => add({ type: 'delete',  message, onDelete }),
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <NotificationStack notifications={notifications} onRemove={remove} />
    </NotificationContext.Provider>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DURATION = 3200;

const CFG = {
  success: { Icon: IconCircleCheck, color: 'var(--color-success)' },
  error:   { Icon: IconAlertCircle,  color: 'var(--color-danger)' },
  info:    { Icon: IconInfoCircle,   color: 'var(--apple-blue)'   },
  confirm: { Icon: IconCircleCheck,  color: 'var(--apple-blue)'   },
  delete:  { Icon: IconTrash,        color: 'var(--color-danger)' },
};

// ─── Stack ────────────────────────────────────────────────────────────────────

function NotificationStack({ notifications, onRemove }) {
  const toasts = notifications.filter(n => !['confirm', 'delete'].includes(n.type));
  const modals = notifications.filter(n =>  ['confirm', 'delete'].includes(n.type));

  return (
    <>
      <div
        aria-live="polite"
        aria-label="Notificaciones"
        style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1300, display: 'flex', flexDirection: 'column',
          gap: '8px', alignItems: 'center',
          width: 'min(92vw, 380px)', pointerEvents: 'none',
        }}
      >
        <AnimatePresence initial={false}>
          {toasts.map(n => (
            <Toast key={n.id} n={n} onRemove={() => onRemove(n.id)} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modals.map((n, i) => (
          <ActionModal key={n.id} n={n} onRemove={() => onRemove(n.id)} index={i} />
        ))}
      </AnimatePresence>
    </>
  );
}

// ─── Toast — pill minimalista ─────────────────────────────────────────────────

function Toast({ n, onRemove }) {
  const { Icon, color } = CFG[n.type];

  useEffect(() => {
    const t = setTimeout(onRemove, DURATION);
    return () => clearTimeout(t);
  }, [onRemove]);

  return (
    <motion.div
      layout
      role="alert"
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,   scale: 1    }}
      exit={{    opacity: 0, y: -8,  scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      style={{
        width: '100%', pointerEvents: 'auto',
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px 10px 12px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--border-divider)',
        boxShadow: 'var(--shadow-float)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Dot */}
      <span style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: color, flexShrink: 0,
      }} />

      {/* Message */}
      <span style={{
        flex: 1, fontSize: 'var(--fs-md)', fontWeight: 500,
        color: 'var(--text-primary)', lineHeight: 1.4,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {n.message}
      </span>

      {/* Dismiss */}
      <motion.button
        onClick={onRemove}
        aria-label="Cerrar"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.85 }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '18px', height: '18px', flexShrink: 0,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-tertiary)', padding: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </motion.button>

      {/* Progress line */}
      <motion.span
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: DURATION / 1000, ease: 'linear' }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '2px', background: color,
          transformOrigin: 'left', opacity: 0.25, borderRadius: '0 0 999px 999px',
        }}
      />
    </motion.div>
  );
}

// ─── ActionModal — confirm / delete ──────────────────────────────────────────

function ActionModal({ n, onRemove, index }) {
  const { type, message, onConfirm, onDelete } = n;
  const { Icon, color } = CFG[type];
  const isDelete = type === 'delete';

  const handleAccept = () => {
    if (onConfirm) onConfirm();
    if (onDelete)  onDelete();
    onRemove();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1300 + index,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--bg-overlay)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.93, y: 8 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{    opacity: 0, scale: 0.93, y: 8 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        style={{
          width: 'min(88vw, 320px)',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-divider)',
          boxShadow: 'var(--shadow-float)',
          padding: '28px 24px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div style={{
          width: '44px', height: '44px', borderRadius: 'var(--radius-circle)',
          background: `color-mix(in srgb, ${isDelete ? 'var(--color-danger)' : 'var(--apple-blue)'} 10%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} style={{ color }} />
        </div>

        {/* Message */}
        <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
          <button
            onClick={onRemove}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-divider)',
              background: 'var(--bg-input)', cursor: 'pointer',
              fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text-secondary)',
              fontFamily: 'var(--font-text)',
            }}
          >
            Cancelar
          </button>
          <motion.button
            onClick={handleAccept}
            whileHover={{ opacity: 0.88 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.12 }}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 'var(--radius-sm)',
              border: 'none', cursor: 'pointer',
              background: isDelete ? 'var(--color-danger)' : 'var(--apple-blue)',
              fontSize: 'var(--fs-body)', fontWeight: 600, color: '#fff',
              fontFamily: 'var(--font-text)',
            }}
          >
            {isDelete ? 'Eliminar' : 'Aceptar'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
