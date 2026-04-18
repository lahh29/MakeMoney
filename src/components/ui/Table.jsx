import React from 'react';

export function Table({ columns = [], data = [], className = '' }) {
  return (
    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }} role="region" aria-label="Tabla de datos" tabIndex={0}>
      <table className={className} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--fs-body)' }} role="table">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-divider)' }}>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border-divider)', transition: 'background-color 0.2s' }}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} style={{ padding: '16px' }}>
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
