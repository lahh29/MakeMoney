import React from 'react';

export function Box({ children, className = '', style, ...props }) {
  return (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  );
}
