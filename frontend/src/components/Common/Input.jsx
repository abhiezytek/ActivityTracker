import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, hint, icon: Icon, rightIcon, required, style, containerStyle, ...props }, ref) => {
  return (
    <div style={{ marginBottom: '16px', ...containerStyle }}>
      {label && (
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: 'var(--text)' }}>
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          style={{
            width: '100%',
            padding: Icon ? '9px 12px 9px 34px' : '9px 12px',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            background: '#fff',
            color: 'var(--text)',
            outline: 'none',
            transition: 'border-color 0.2s',
            fontSize: '14px',
            ...style,
          }}
          onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
          {...props}
        />
        {rightIcon && (
          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
      {hint && !error && <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, required, style, containerStyle, ...props }, ref) => (
  <div style={{ marginBottom: '16px', ...containerStyle }}>
    {label && (
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: 'var(--text)' }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      style={{
        width: '100%',
        padding: '9px 12px',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        background: '#fff',
        color: 'var(--text)',
        outline: 'none',
        resize: 'vertical',
        minHeight: '80px',
        fontSize: '14px',
        fontFamily: 'inherit',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'}
      {...props}
    />
    {error && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ label, error, required, children, style, containerStyle, ...props }, ref) => (
  <div style={{ marginBottom: '16px', ...containerStyle }}>
    {label && (
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
      </label>
    )}
    <select
      ref={ref}
      style={{
        width: '100%',
        padding: '9px 12px',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        background: '#fff',
        color: 'var(--text)',
        outline: 'none',
        fontSize: '14px',
        cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
    {error && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
  </div>
));

Select.displayName = 'Select';

export default Input;
