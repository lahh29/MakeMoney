import React from 'react';
import { motion } from 'framer-motion';

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

export function Button({ children, variant = 'primary', icon: Icon, animationType, className = '', ...props }) {
  const anim = ANIM[animationType] || ANIM[variant] || ANIM.default;
  const variantClass = variant === 'pill' ? 'btn-pill' :
                       variant === 'dark' ? 'btn-dark' :
                       variant === 'primary' ? 'btn-primary' : '';
  const iconOnlyClass = Icon && !children ? 'btn--icon-only' : '';

  return (
    <motion.button
      className={`btn ${variantClass} ${iconOnlyClass} ${className}`.trim()}
      whileHover={anim.whileHover}
      whileTap={anim.whileTap}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </motion.button>
  );
}
