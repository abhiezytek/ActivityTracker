import React from 'react';

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'var(--transition)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  primary: {
    background: 'var(--primary)',
    color: '#fff',
  },
  secondary: {
    background: 'var(--bg)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
  },
  success: {
    background: 'var(--success)',
    color: '#fff',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--primary)',
    border: '1px solid var(--primary)',
  },
  sm: { padding: '5px 10px', fontSize: '12px' },
  lg: { padding: '10px 24px', fontSize: '16px' },
  icon: { padding: '8px', borderRadius: 'var(--radius)' },
};

const Button = ({ children, variant = 'primary', size, icon: Icon, loading, disabled, onClick, type = 'button', style, className, ...rest }) => {
  const btnStyle = {
    ...styles.base,
    ...(styles[variant] || styles.primary),
    ...(size && styles[size]),
    opacity: disabled || loading ? 0.7 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    ...style,
  };

  return (
    <button type={type} style={btnStyle} disabled={disabled || loading} onClick={onClick} className={className} {...rest}>
      {loading ? (
        <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
      ) : Icon && (
        <Icon size={14} />
      )}
      {children}
    </button>
  );
};

export default Button;
