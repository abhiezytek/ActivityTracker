import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, loading, confirmLabel = 'Confirm', variant = 'danger' }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>
    }
  >
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }}>
        <AlertTriangle size={20} />
      </div>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{message}</p>
    </div>
  </Modal>
);

export default ConfirmDialog;
