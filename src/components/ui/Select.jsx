import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';

export function Select({ label, id, options = [], value, onChange, placeholder = 'Seleccionar...', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value || '');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  // Calcular posición del dropdown cuando se abre
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  const selectedOption = options.find(o => (o.value || o) === selected);
  const displayLabel = selectedOption ? (selectedOption.label || selectedOption) : placeholder;

  const handleSelect = (opt) => {
    const val = opt.value || opt;
    setSelected(val);
    setIsOpen(false);
    if (onChange) onChange(val);
  };

  return (
    <div className={`form-group ${className}`.trim()} ref={ref} style={{ position: 'relative' }}>
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 14px',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-divider)',
          borderRadius: isOpen ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
          fontFamily: 'var(--font-text)', fontSize: '17px',
          color: selected ? 'var(--text-primary)' : 'var(--text-tertiary)',
          cursor: 'pointer', textAlign: 'left', outline: 'none',
          transition: 'border-color 0.2s',
          boxShadow: 'none'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayLabel}
        </span>
        <IconChevronDown 
          size={16} 
          style={{ 
            flexShrink: 0, color: 'var(--text-tertiary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </button>

      {/* Dropdown list — rendered via Portal to body */}
      {isOpen && ReactDOM.createPortal(
        <div 
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 9999,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-divider)',
            borderTop: 'none',
            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
            boxShadow: 'var(--shadow-float)',
            maxHeight: '200px', overflowY: 'auto',
            animation: 'dropdownFadeIn 0.15s ease'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {options.map((opt, i) => {
            const optValue = opt.value || opt;
            const optLabel = opt.label || opt;
            const isSelected = optValue === selected;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(opt)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '10px 14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-text)', fontSize: '15px',
                  color: isSelected ? 'var(--apple-blue)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 600 : 400, textAlign: 'left',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span>{optLabel}</span>
                {isSelected && <IconCheck size={16} style={{ color: 'var(--apple-blue)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
