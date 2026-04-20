import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0.8 },
  visible: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 }
};

export function Sidebar({ children, isOpen = true, className = '', style }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="sidebar-wrapper"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '220px',
            height: '100%',
            zIndex: 110,
            overflow: 'hidden',
          }}
        >
          <motion.aside
            className={`sidebar ${className}`.trim()}
            style={{
              ...style,
              position: 'relative',
              height: '100%',
              width: '100%',
            }}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
          >
          {/* Brand bar */}
          <div style={{
            height: 'calc(48px + env(safe-area-inset-top))',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            paddingTop: 'env(safe-area-inset-top)',
            paddingLeft: '20px',
            paddingRight: '20px',
            borderBottom: '1px solid var(--border-divider)',
            flexShrink: 0,
          }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--fs-nav)', letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>ViñoPlastic</span>
          </div>

          {/* Nav content */}
          <div style={{ padding: '12px 0', flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
            {children}
          </div>

        </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
