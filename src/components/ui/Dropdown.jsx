import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Dropdown({ trigger, children, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown-menu"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              [align === 'right' ? 'right' : 'left']: 0,
              minWidth: '220px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
              zIndex: 200,
              overflow: 'hidden',
              transformOrigin: align === 'right' ? 'top right' : 'top left',
            }}
          >
            {typeof children === 'function' ? children(() => setIsOpen(false), isOpen) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        width: '100%', padding: '10px 16px',
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-text)', fontSize: '14px',
        color: danger ? '#ff3b30' : 'var(--text-primary)',
        transition: 'background-color 0.15s ease',
        textAlign: 'left'
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {Icon && <Icon size={16} style={{ opacity: 0.7 }} />}
      <span>{label}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div style={{ height: '1px', backgroundColor: 'var(--border-divider)', margin: '4px 0' }} />;
}
