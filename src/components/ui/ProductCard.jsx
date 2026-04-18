import React from 'react';
import { Button } from './Button';

export function ProductCard({ title, description, image, price, onLearnMore, onBuy }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '32px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
        {image ? (
          <img src={image} alt={title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>[Imagen del Producto]</div>
        )}
      </div>
      
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, letterSpacing: '0.196px', lineHeight: 1.14 }}>
          {title}
        </h3>
        
        {description && (
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.47 }}>
            {description}
          </p>
        )}
        
        {price && (
          <p style={{ margin: '0 0 24px 0', fontSize: '17px', fontWeight: 600 }}>
            {price}
          </p>
        )}
        
        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {onLearnMore && <Button variant="pill" onClick={onLearnMore}>Más info</Button>}
          {onBuy && <Button variant="primary" onClick={onBuy}>Comprar</Button>}
        </div>
      </div>
    </div>
  );
}
