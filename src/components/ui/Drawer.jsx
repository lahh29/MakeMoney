import React from 'react';
import { motion } from 'framer-motion';
import { IconX, IconCheck, IconTrash } from '@tabler/icons-react';

const PANEL_ANIM = {
  close:  { whileHover: { rotate: 90, scale: 1.15 }, whileTap: { scale: 0.85 } },
  save:   { whileHover: { scale: 1.18, y: -1 },       whileTap: { scale: 0.88 } },
  delete: { whileHover: { x: [-2, 2, -2, 2, 0], transition: { duration: 0.35 } }, whileTap: { scale: 0.88 } },
};

const spring = { type: 'spring', stiffness: 400, damping: 25 };

export function Drawer({ 
  isOpen, onClose, onDelete, onAccept, title, children, 
  cancelLabel = 'Cancelar', deleteLabel = 'Borrar', acceptLabel = 'Aceptar',
  showDelete = false 
}) {
  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 1040, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)', 
      backdropFilter: 'saturate(180%) blur(4px)',
      WebkitBackdropFilter: 'saturate(180%) blur(4px)'
    }}>
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
      <div style={{ 
        position: 'relative', width: '90%', maxWidth: '560px', maxHeight: '85vh',
        backgroundColor: 'var(--bg-card)', borderRadius: '20px',
        border: '1px solid var(--border-divider)', boxShadow: 'var(--shadow-float)',
        display: 'flex', flexDirection: 'column', animation: 'dropdownFadeIn 0.2s ease'
      }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', padding: '12px 16px',
          borderBottom: '1px solid var(--border-divider)', minHeight: '48px', gap: '8px'
        }}>
          <motion.button
            className="panel-action panel-action--icon"
            onClick={onClose}
            title={cancelLabel}
            aria-label={cancelLabel}
            whileHover={PANEL_ANIM.close.whileHover}
            whileTap={PANEL_ANIM.close.whileTap}
            transition={spring}
          ><IconX size={18} /></motion.button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            {showDelete && onDelete && (
              <motion.button
                className="panel-action panel-action--icon panel-action--danger"
                onClick={onDelete}
                title={deleteLabel}
                aria-label={deleteLabel}
                whileHover={PANEL_ANIM.delete.whileHover}
                whileTap={PANEL_ANIM.delete.whileTap}
                transition={spring}
              ><IconTrash size={18} /></motion.button>
            )}
            {onAccept && (
              <motion.button
                className="panel-action panel-action--icon panel-action--bold"
                onClick={onAccept}
                title={acceptLabel}
                aria-label={acceptLabel}
                whileHover={PANEL_ANIM.save.whileHover}
                whileTap={PANEL_ANIM.save.whileTap}
                transition={spring}
              ><IconCheck size={18} /></motion.button>
            )}
          </div>
        </div>
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}
