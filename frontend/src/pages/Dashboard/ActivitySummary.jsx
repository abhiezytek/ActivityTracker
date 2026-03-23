import React from 'react';
import { Phone, Users, Calendar, Mail, ArrowRight } from 'lucide-react';
import Card from '../../components/Common/Card';
import { formatRelative } from '../../utils/formatters';
import Badge from '../../components/Common/Badge';
import { Link } from 'react-router-dom';

const activityIcons = {
  call: Phone,
  meeting: Users,
  follow_up: Calendar,
  email: Mail,
};

const ActivitySummary = ({ activities, loading }) => {
  const items = activities || [];

  return (
    <Card
      title="Recent Activities"
      actions={<Link to="/activities" style={{ fontSize: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>View all <ArrowRight size={12} /></Link>}
    >
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activities</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {items.slice(0, 6).map((act, i) => {
            const Icon = activityIcons[act.type] || Calendar;
            return (
              <div key={act.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                  <Icon size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {act.lead?.name || act.leadName || 'Lead'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{act.notes || act.outcome || act.type}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Badge value={act.type} size="sm" />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{formatRelative(act.createdAt || act.date)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ActivitySummary;
