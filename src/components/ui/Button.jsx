import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANIM = {
  close:    { whileHover: { rotate: 90, scale: 1.1 },                                      whileTap: { scale: 0.88 } },
  save:     { whileHover: { scale: 1.18, y: -1 },                                          whileTap: { scale: 0.9  } },
  delete:   { whileHover: { x: [-2, 2, -2, 2, 0], transition: { duration: 0.35 } },       whileTap: { scale: 0.88 } },
  toggle:   { whileHover: { rotate: 180, scale: 1.1 },                                     whileTap: { scale: 0.88 } },
  logout:   { whileHover: { x: -3, scale: 1.1 },                                           whileTap: { scale: 0.88 } },
  settings: { whileHover: { rotate: 45, scale: 1.1 },                                      whileTap: { scale: 0.88 } },
  eye:      { whileHover: { scale: 1.15 },                                                  whileTap: { scale: 0.9  } },
  add:      { whileHover: { rotate: 90, scale: 1.15 },                                     whileTap: { scale: 0.88 } },
  search:   { whileHover: { scale: 1.1 },                                                   whileTap: { scale: 0.9  } },
  primary:  { whileHover: { scale: 1.03 },                                                  whileTap: { scale: 0.97 } },
  default:  { whileHover: { scale: 1.05 },                                                  whileTap: { scale: 0.95 } },
};

const Spinner = () => (
  <motion.svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
    style={{ flexShrink: 0 }}
  >
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
    <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </motion.svg>
);

export function Button({ children, variant = 'primary', icon: Icon, animationType, loading, className = '', ...props }) {
  const anim = ANIM[animationType] || ANIM[variant] || ANIM.default;
  const variantClass = variant === 'pill' ? 'btn-pill' :
                       variant === 'dark' ? 'btn-dark' :
                       variant === 'primary' ? 'btn-primary' : '';
  const iconOnlyClass = Icon && !children ? 'btn--icon-only' : '';

  return (
    <motion.button
      className={`btn ${variantClass} ${iconOnlyClass} ${className}`.trim()}
      whileHover={loading ? {} : anim.whileHover}
      whileTap={loading ? {} : anim.whileTap}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={loading || props.disabled}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Spinner />
            <span>Guardando…</span>
          </motion.span>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {Icon && <Icon size={18} />}
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
