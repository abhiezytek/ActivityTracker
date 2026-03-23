import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', message, action, actionLabel }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
    <div style={{ background: 'var(--bg)', borderRadius: '50%', padding: '20px', marginBottom: '16px', color: 'var(--text-muted)' }}>
      <Icon size={40} />
    </div>
    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
    {message && <p style={{ color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>{message}</p>}
    {action && actionLabel && (
      <Button onClick={action} style={{ marginTop: '20px' }}>{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;
