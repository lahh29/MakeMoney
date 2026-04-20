import React, { useState, useRef, useEffect } from 'react';

export function Popover({ trigger, content, position = 'bottom', align = 'start' }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={popoverRef}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      {isOpen && (
        <div className="card" style={{ 
          position: 'absolute', 
          zIndex: 1050, 
          top: position === 'bottom' ? '100%' : 'auto',
          bottom: position === 'top' ? '100%' : 'auto',
          left: align === 'end' ? 'auto' : (position === 'right' ? '100%' : position === 'bottom' ? '0' : 'auto'),
          right: align === 'end' ? '0' : (position === 'left' ? '100%' : 'auto'),
          marginTop: position === 'bottom' ? '8px' : 0,
          marginBottom: position === 'top' ? '8px' : 0,
          padding: '12px',
          minWidth: '200px'
        }}>
          {content}
        </div>
      )}
    </div>
  );
}
