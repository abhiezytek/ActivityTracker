import React from 'react';

const colorMap = {
  new: { bg: '#dbeafe', color: '#1d4ed8' },
  contacted: { bg: '#ede9fe', color: '#6d28d9' },
  qualified: { bg: '#fef3c7', color: '#92400e' },
  proposal: { bg: '#ffedd5', color: '#c2410c' },
  negotiation: { bg: '#fce7f3', color: '#9d174d' },
  closed_won: { bg: '#dcfce7', color: '#166534' },
  closed_lost: { bg: '#fee2e2', color: '#991b1b' },
  active: { bg: '#dcfce7', color: '#166534' },
  expired: { bg: '#fee2e2', color: '#991b1b' },
  cancelled: { bg: '#f1f5f9', color: '#475569' },
  pending: { bg: '#fef3c7', color: '#92400e' },
  call: { bg: '#dbeafe', color: '#1d4ed8' },
  meeting: { bg: '#ede9fe', color: '#6d28d9' },
  follow_up: { bg: '#fef3c7', color: '#92400e' },
  email: { bg: '#f0fdf4', color: '#166534' },
  whatsapp: { bg: '#dcfce7', color: '#166534' },
  site_visit: { bg: '#ffedd5', color: '#c2410c' },
  admin: { bg: '#fce7f3', color: '#9d174d' },
  manager: { bg: '#dbeafe', color: '#1d4ed8' },
  agent: { bg: '#f0fdf4', color: '#166534' },
};

const Badge = ({ value, label, color, bg, size = 'sm' }) => {
  const preset = colorMap[value?.toLowerCase?.()];
  const bgColor = bg || preset?.bg || '#f1f5f9';
  const textColor = color || preset?.color || '#475569';
  const text = label || value || '';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: '999px',
      fontSize: size === 'sm' ? '11px' : '13px',
      fontWeight: 600,
      background: bgColor,
      color: textColor,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    }}>
      {text.replace(/_/g, ' ')}
    </span>
  );
};

export default Badge;
