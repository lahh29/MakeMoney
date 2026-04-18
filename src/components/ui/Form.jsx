import React from 'react';

export function Form({ onSubmit, children, className = '', ...props }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={className} {...props}>
      {children}
    </form>
  );
}

export function FormGroup({ children, className = '' }) {
  return <div className={`form-group ${className}`.trim()}>{children}</div>;
}
