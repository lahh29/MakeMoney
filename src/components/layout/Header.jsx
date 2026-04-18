import React from 'react';

export function Header({ children, className = '', ...props }) {
  return (
    <header className={`header ${className}`.trim()} {...props}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 20px' }}>
        {children}
      </div>
    </header>
  );
}
