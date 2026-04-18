import React from 'react';

export function Dialog({ 
  isOpen, onClose, onAccept, onDelete, title, children,
  cancelLabel = 'Cancelar', deleteLabel = 'Borrar', acceptLabel = 'Aceptar',
  showDelete = false
}) {
  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 1050, 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      backgroundColor: 'var(--bg-overlay)', 
      backdropFilter: 'saturate(180%) blur(4px)',
      WebkitBackdropFilter: 'saturate(180%) blur(4px)'
    }}>
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
      <div role="alertdialog" aria-modal="true" aria-label={title} style={{ 
        position: 'relative', minWidth: '280px', maxWidth: '400px', width: '85%',
        backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-divider)', boxShadow: 'var(--shadow-float)',
        display: 'flex', flexDirection: 'column', animation: 'dropdownFadeIn 0.2s ease'
      }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', padding: '12px 16px',
          borderBottom: '1px solid var(--border-divider)', minHeight: '48px', gap: '8px'
        }}>
          <button className="panel-action" onClick={onClose}>{cancelLabel}</button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 'var(--fs-nav)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            {showDelete && onDelete && <button className="panel-action panel-action--danger" onClick={onDelete}>{deleteLabel}</button>}
            {onAccept && <button className="panel-action panel-action--bold" onClick={onAccept}>{acceptLabel}</button>}
          </div>
        </div>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-body)', lineHeight: 1.47 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
