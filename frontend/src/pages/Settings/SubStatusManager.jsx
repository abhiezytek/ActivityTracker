import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { getSubStatuses, createSubStatus, deleteSubStatus } from '../../api/config';
import Button from '../../components/Common/Button';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { LEAD_STATUSES } from '../../utils/constants';
import { toast } from 'react-toastify';

const SubStatusManager = () => {
  const qc = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('new');
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sub-statuses', selectedStatus],
    queryFn: () => getSubStatuses({ status: selectedStatus }).then(r => r.data),
  });
  const items = data?.subStatuses || data || [];

  const createMutation = useMutation({
    mutationFn: createSubStatus,
    onSuccess: () => { qc.invalidateQueries(['sub-statuses']); toast.success('Sub-status created'); setNewName(''); },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubStatus,
    onSuccess: () => { qc.invalidateQueries(['sub-statuses']); toast.success('Deleted'); setDeleteId(null); },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Sub-Statuses</h3>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>Lead Status</label>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none', cursor: 'pointer', minWidth: '200px' }}>
          {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={`Add sub-status for ${selectedStatus}...`}
          style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none' }} />
        <Button icon={Plus} onClick={() => newName.trim() && createMutation.mutate({ name: newName.trim(), status: selectedStatus })} loading={createMutation.isPending}>Add</Button>
      </div>
      {isLoading ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <span style={{ fontSize: '13px' }}>{item.name}</span>
              <button onClick={() => setDeleteId(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}><Trash2 size={14} /></button>
            </div>
          ))}
          {items.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No sub-statuses for "{selectedStatus}"</div>}
        </div>
      )}
      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)} title="Delete Sub-Status"
        message="Delete this sub-status?" loading={deleteMutation.isPending} />
    </div>
  );
};

export default SubStatusManager;
