import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, color = '#1e40af', trend, trendLabel, loading }) => {
  const formattedValue = loading ? '...' : value ?? '—';

  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '20px',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
      display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{title}</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{formattedValue}</p>
        </div>
        <div style={{ background: `${color}15`, borderRadius: '10px', padding: '10px', color }}>
          <Icon size={22} />
        </div>
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {trend >= 0 ? <TrendingUp size={14} style={{ color: 'var(--success)' }} /> : <TrendingDown size={14} style={{ color: 'var(--danger)' }} />}
          <span style={{ fontSize: '12px', color: trend >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
            {Math.abs(trend)}%
          </span>
          {trendLabel && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default KPICard;
