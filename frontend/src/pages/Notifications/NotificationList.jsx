import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, AlertCircle, Calendar } from 'lucide-react';
import { getNotifications, markAsRead, markAllRead, deleteNotification } from '../../api/notifications';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/Common/Button';
import { formatRelative, formatDateTime } from '../../utils/formatters';
import { toast } from 'react-toastify';

const typeIcons = {
  reminder: { icon: Calendar, color: '#1e40af', bg: '#dbeafe' },
  renewal: { icon: AlertCircle, color: '#d97706', bg: '#fef3c7' },
  missed: { icon: Bell, color: '#dc2626', bg: '#fee2e2' },
  default: { icon: Bell, color: '#64748b', bg: '#f1f5f9' },
};

const NotificationList = () => {
  const qc = useQueryClient();
  const { resetCount } = useNotifications();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then(r => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => { qc.invalidateQueries(['notifications']); resetCount(); toast.success('All notifications marked as read'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const notifications = data?.notifications || data || [];
  const unread = notifications.filter(n => !n.isRead && !n.read_at);

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px' }}>Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <Button variant="secondary" icon={Check} size="sm" onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
            Mark All Read
          </Button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Bell size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No notifications</p>
          </div>
        ) : (
          notifications.map((notif, i) => {
            const isRead = notif.isRead || notif.read_at;
            const config = typeIcons[notif.type] || typeIcons.default;
            const Icon = config.icon;
            return (
              <div key={notif.id || i}
                style={{ display: 'flex', gap: '12px', padding: '14px 16px', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none', background: isRead ? '#fff' : '#eff6ff', cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => !isRead && markReadMutation.mutate(notif.id)}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: config.bg, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <p style={{ fontSize: '13px', fontWeight: isRead ? 400 : 600, color: 'var(--text)', lineHeight: 1.4 }}>{notif.message || notif.title}</p>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {!isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: '4px' }} />}
                      <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(notif.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatRelative(notif.createdAt || notif.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationList;
