import React, { useState } from 'react';
import { Plus, Calendar, List, Trash2 } from 'lucide-react';
import { useActivities, useDeleteActivity } from '../../hooks/useActivities';
import Badge from '../../components/Common/Badge';
import Table from '../../components/Common/Table';
import Button from '../../components/Common/Button';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import ActivityForm from './ActivityForm';
import ActivityTimeline from './ActivityTimeline';
import { formatDateTime } from '../../utils/formatters';
import { ACTIVITY_TYPES } from '../../utils/constants';

const ActivityList = () => {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [view, setView] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useActivities({ ...filters, page, pageSize: 20 });
  const deleteMutation = useDeleteActivity();

  const activities = data?.activities || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'type', header: 'Type', render: v => <Badge value={v} /> },
    { key: 'lead', header: 'Lead', render: (v, row) => <span style={{ fontSize: '13px', fontWeight: 500 }}>{v?.name || row.leadName || '—'}</span> },
    { key: 'outcome', header: 'Outcome', render: v => v ? <Badge value={v} bg="#f1f5f9" color="var(--text-muted)" /> : '—' },
    { key: 'activityDate', header: 'Date', render: v => <span style={{ fontSize: '12px' }}>{formatDateTime(v)}</span> },
    { key: 'duration', header: 'Duration', render: v => v ? `${v} min` : '—' },
    { key: 'notes', header: 'Notes', render: v => <span style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>{v || '—'}</span> },
    { key: 'createdBy', header: 'By', render: (v) => <span style={{ fontSize: '12px' }}>{v?.name || '—'}</span> },
    { key: 'actions', header: '', render: (_, row) => (
      <button onClick={() => setDeleteId(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
        <Trash2 size={14} />
      </button>
    )},
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px' }}>Activities</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{total} total activities</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <button onClick={() => setView('list')} style={{ padding: '7px 10px', background: view === 'list' ? 'var(--primary)' : '#fff', color: view === 'list' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <List size={14} />
            </button>
            <button onClick={() => setView('timeline')} style={{ padding: '7px 10px', background: view === 'timeline' ? 'var(--primary)' : '#fff', color: view === 'timeline' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Calendar size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {ACTIVITY_TYPES.map(t => (
              <button key={t.value} onClick={() => setFilters(f => ({ ...f, type: f.type === t.value ? '' : t.value }))}
                style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: '999px', background: filters.type === t.value ? 'var(--primary)' : '#fff', color: filters.type === t.value ? '#fff' : 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', fontWeight: 500 }}>
                {t.label}
              </button>
            ))}
          </div>
          <Button icon={Plus} size="sm" onClick={() => setShowForm(true)}>Log Activity</Button>
        </div>
      </div>

      {view === 'list' ? (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <Table
            columns={columns}
            data={activities}
            loading={isLoading}
            pagination={{ page, pageSize: 20, total, totalPages: Math.ceil(total / 20) }}
            onPageChange={setPage}
            emptyMessage="No activities yet. Start logging your sales activities!"
          />
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px' }}>
          <ActivityTimeline activities={activities} loading={isLoading} />
        </div>
      )}

      {showForm && <ActivityForm isOpen={showForm} onClose={() => setShowForm(false)} />}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => { await deleteMutation.mutateAsync(deleteId); setDeleteId(null); }}
        title="Delete Activity"
        message="Are you sure you want to delete this activity?"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ActivityList;
