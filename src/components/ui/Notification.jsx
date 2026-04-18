import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCircleCheck, IconAlertTriangle, IconTrash, IconInfoCircle, IconX, IconCheck } from '@tabler/icons-react';

const NotificationContext = createContext(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be inside NotificationProvider');
  return ctx;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, ...notification }]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = {
    success: (message) => addNotification({ type: 'success', message }),
    error: (message) => addNotification({ type: 'error', message }),
    info: (message) => addNotification({ type: 'info', message }),
    confirm: (message, onConfirm) => addNotification({ type: 'confirm', message, onConfirm }),
    deleteConfirm: (message, onDelete) => addNotification({ type: 'delete', message, onDelete }),
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <NotificationStack notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

const ICONS = {
  success: IconCircleCheck,
  error: IconAlertTriangle,
  info: IconInfoCircle,
  confirm: IconCircleCheck,
  delete: IconTrash,
};

const ACCENT = {
  success: '#34c759',
  error: '#ff3b30',
  info: 'var(--apple-blue)',
  confirm: 'var(--apple-blue)',
  delete: '#ff3b30',
};

const TITLES = {
  success: 'Correcto',
  error: 'Error',
  info: 'Información',
  confirm: 'Confirmar',
  delete: 'Eliminar',
};

function NotificationStack({ notifications, onRemove }) {
  return (
    <AnimatePresence>
      {notifications.map((n, i) => (
        <NotificationItem key={n.id} notification={n} onRemove={() => onRemove(n.id)} index={i} />
      ))}
    </AnimatePresence>
  );
}

function NotificationItem({ notification, onRemove, index }) {
  const { type, message, onConfirm, onDelete } = notification;
  const Icon = ICONS[type];
  const accent = ACCENT[type];
  const title = TITLES[type];
  const isAction = type === 'confirm' || type === 'delete';

  useEffect(() => {
    if (!isAction) {
      const timer = setTimeout(onRemove, 3500);
      return () => clearTimeout(timer);
    }
  }, [isAction, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200 + index,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: isAction ? 'rgba(0,0,0,0.3)' : 'transparent',
        pointerEvents: isAction ? 'auto' : 'none'
      }}
    >
      <div style={{
        width: '90%', maxWidth: '360px',
        backgroundColor: 'var(--bg-card)', borderRadius: '20px',
        border: '1px solid var(--border-divider)', boxShadow: 'var(--shadow-float)',
        display: 'flex', flexDirection: 'column', pointerEvents: 'auto', overflow: 'hidden'
      }}>
        {/* Barra superior pill */}
        <div style={{ 
          display: 'flex', alignItems: 'center', padding: '12px 16px',
          borderBottom: '1px solid var(--border-divider)', minHeight: '48px', gap: '8px'
        }}>
          {isAction ? (
            <motion.button
              className="panel-action panel-action--icon"
              onClick={onRemove}
              title="Cancelar"
              aria-label="Cancelar"
              whileHover={{ rotate: 90, scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            ><IconX size={18} /></motion.button>
          ) : (
            <motion.button
              className="panel-action panel-action--icon"
              onClick={onRemove}
              title="Cerrar"
              aria-label="Cerrar"
              whileHover={{ rotate: 90, scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            ><IconX size={18} /></motion.button>
          )}

          <span style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>

          <div style={{ flexShrink: 0 }}>
            {isAction ? (
              <motion.button
                className={`panel-action panel-action--icon panel-action--bold ${type === 'delete' ? 'panel-action--danger' : ''}`}
                onClick={() => {
                  if (type === 'confirm' && onConfirm) onConfirm();
                  if (type === 'delete' && onDelete) onDelete();
                  onRemove();
                }}
                title={type === 'delete' ? 'Eliminar' : 'Aceptar'}
                aria-label={type === 'delete' ? 'Eliminar' : 'Aceptar'}
                whileHover={type === 'delete'
                  ? { x: [-2, 2, -2, 2, 0], transition: { duration: 0.35 } }
                  : { scale: 1.18, y: -1 }
                }
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {type === 'delete' ? <IconTrash size={18} /> : <IconCheck size={18} />}
              </motion.button>
            ) : (
              <div style={{ width: '28px' }} />
            )}
          </div>
        </div>

        {/* Contenido */}
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <Icon size={22} style={{ color: accent, flexShrink: 0, marginTop: '1px' }} />
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.47 }}>{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
