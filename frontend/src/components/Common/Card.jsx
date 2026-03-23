import React from 'react';

const Card = ({ children, style, title, actions, padding = '20px' }) => (
  <div style={{
    background: 'var(--bg-white)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
    ...style,
  }}>
    {(title || actions) && (
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {title && <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{title}</h3>}
        {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
      </div>
    )}
    <div style={{ padding }}>{children}</div>
  </div>
);

export default Card;
