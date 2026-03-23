import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRenewalAlerts } from '../../api/policies';
import { AlertTriangle } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

const RenewalAlerts = () => {
  const { data } = useQuery({
    queryKey: ['renewal-alerts'],
    queryFn: () => getRenewalAlerts().then(r => r.data),
  });

  const alerts = data?.alerts || data || {};
  const buckets = [
    { label: '≤ 30 days', items: alerts.within30 || [], color: 'var(--danger)', bg: '#fee2e2', borderColor: '#fca5a5' },
    { label: '31–60 days', items: alerts.within60 || [], color: 'var(--warning)', bg: '#fef3c7', borderColor: '#fcd34d' },
    { label: '61–90 days', items: alerts.within90 || [], color: '#92400e', bg: '#fffbeb', borderColor: '#fde68a' },
  ];

  const total = buckets.reduce((s, b) => s + b.items.length, 0);
  if (total === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
      {buckets.map(bucket => (
        <div key={bucket.label} style={{ background: bucket.bg, border: `1px solid ${bucket.borderColor}`, borderRadius: 'var(--radius-lg)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={16} style={{ color: bucket.color }} />
            <span style={{ fontWeight: 600, color: bucket.color, fontSize: '14px' }}>{bucket.label}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 700, color: bucket.color, fontSize: '18px' }}>{bucket.items.length}</span>
          </div>
          {bucket.items.slice(0, 3).map((p, i) => (
            <div key={i} style={{ fontSize: '12px', padding: '6px 0', borderBottom: i < Math.min(bucket.items.length, 3) - 1 ? `1px solid ${bucket.borderColor}` : 'none' }}>
              <div style={{ fontWeight: 500, color: 'var(--text)' }}>{p.customer?.name || p.customerName || '—'}</div>
              <div style={{ color: 'var(--text-muted)' }}>{formatDate(p.endDate)} • {formatCurrency(p.premium)}</div>
            </div>
          ))}
          {bucket.items.length > 3 && <div style={{ fontSize: '11px', color: bucket.color, marginTop: '6px' }}>+{bucket.items.length - 3} more</div>}
        </div>
      ))}
    </div>
  );
};

export default RenewalAlerts;
