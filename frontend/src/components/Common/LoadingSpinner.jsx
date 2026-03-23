import React from 'react';

const LoadingSpinner = ({ size = 40, message = 'Loading...', fullPage }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: size, height: size,
        border: `3px solid var(--border)`,
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {message && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{message}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
