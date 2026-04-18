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
  default:  { whileHover: { scale: 1.1 },                                                   whileTap: { scale: 0.92 } },
};

export function IconButton({ icon: Icon, animationType = 'default', className = '', ...props }) {
  const anim = ANIM[animationType] || ANIM.default;
  return (
    <motion.button
      className={`icon-btn ${className}`.trim()}
      whileHover={anim.whileHover}
      whileTap={anim.whileTap}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {Icon && <Icon size={18} />}
    </motion.button>
  );
}
