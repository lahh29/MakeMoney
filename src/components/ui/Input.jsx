import React from 'react';

export function Input({ label, id, className = '', type, value, onChange, min, max, step = 1, ...props }) {
  if (type === 'number') {
    const num = value === '' ? '' : Number(value);
    const minVal = min !== undefined ? Number(min) : -Infinity;
    const maxVal = max !== undefined ? Number(max) : Infinity;

    const adjust = (delta) => {
      const next = (num === '' ? 0 : num) + delta;
      if (next < minVal || next > maxVal) return;
      onChange?.({ target: { value: String(next) } });
    };

    return (
      <div className="form-group">
        {label && <label htmlFor={id} className="form-label">{label}</label>}
        <div className="input-stepper">
          <button
            type="button"
            className="input-stepper__btn"
            onClick={() => adjust(-step)}
            aria-label="Disminuir"
            tabIndex={-1}
          >−</button>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            className={`form-input input-stepper__field ${className}`.trim()}
            value={value}
            onChange={onChange}
            {...props}
          />
          <button
            type="button"
            className="input-stepper__btn"
            onClick={() => adjust(step)}
            aria-label="Aumentar"
            tabIndex={-1}
          >+</button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <input id={id} type={type} className={`form-input ${className}`.trim()} value={value} onChange={onChange} {...props} />
    </div>
  );
}
