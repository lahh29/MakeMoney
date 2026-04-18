import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0.8 },
  visible: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 }
};

export function Sidebar({ children, isOpen = true, className = '', ...props }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className={`sidebar ${className}`.trim()}
          style={props.style}
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
          {...props}
        >
          {/* Barra superior alineada con header */}
          <div style={{ 
            height: 'calc(48px + env(safe-area-inset-top))', 
            minHeight: '48px',
            display: 'flex', 
            alignItems: 'center',
            paddingTop: 'env(safe-area-inset-top)',
            paddingLeft: '20px',
            paddingRight: '20px',
            borderBottom: '1px solid var(--border-divider)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>Vertx Systems</span>
            </div>
          </div>
          
          {/* Contenido */}
          <div style={{ padding: '12px 0', flex: 1, overflowY: 'auto' }}>
            {children || (
              <nav>
                <ul style={{listStyle: 'none', padding: 0}}>
                  <li style={{padding: '8px 0', borderBottom: '1px solid var(--border-divider)'}}>Menu Item 1</li>
                </ul>
              </nav>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
