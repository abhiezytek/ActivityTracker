import React from 'react';
import { Phone, Users, Calendar, Mail, MessageSquare, MapPin, Clock } from 'lucide-react';
import { formatDateTime, formatRelative } from '../../utils/formatters';
import Badge from '../../components/Common/Badge';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const typeIcons = {
  call: { icon: Phone, color: '#1e40af', bg: '#dbeafe' },
  meeting: { icon: Users, color: '#6d28d9', bg: '#ede9fe' },
  follow_up: { icon: Calendar, color: '#92400e', bg: '#fef3c7' },
  email: { icon: Mail, color: '#166534', bg: '#dcfce7' },
  whatsapp: { icon: MessageSquare, color: '#166534', bg: '#dcfce7' },
  site_visit: { icon: MapPin, color: '#c2410c', bg: '#ffedd5' },
};

const ActivityTimeline = ({ activities = [], loading }) => {
  if (loading) return <LoadingSpinner />;
  if (!activities.length) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
      No activities yet. Log your first activity!
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: '19px', top: 0, bottom: 0, width: '2px', background: 'var(--border)' }} />
      {activities.map((act, i) => {
        const config = typeIcons[act.type] || typeIcons.call;
        const Icon = config.icon;
        return (
          <div key={act.id || i} style={{ display: 'flex', gap: '16px', marginBottom: '16px', position: 'relative' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: config.bg, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid white', boxShadow: 'var(--shadow)', zIndex: 1 }}>
              <Icon size={16} />
            </div>
            <div style={{ flex: 1, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge value={act.type} size="sm" />
                  {act.outcome && <Badge value={act.outcome} bg="#f1f5f9" color="var(--text-muted)" size="sm" />}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatRelative(act.createdAt || act.date)}</span>
              </div>
              {act.notes && <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>{act.notes}</p>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                {act.duration && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={11} /> {act.duration} min
                  </span>
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDateTime(act.activityDate || act.date || act.createdAt)}</span>
                {act.createdBy && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>by {act.createdBy?.name || act.createdBy}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
