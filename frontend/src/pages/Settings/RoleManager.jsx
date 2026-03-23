import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { getRoles, createRole, deleteRole } from '../../api/users';
import Button from '../../components/Common/Button';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { toast } from 'react-toastify';

const RoleManager = () => {
  const qc = useQueryClient();
  const [newRole, setNewRole] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['roles'], queryFn: () => getRoles().then(r => r.data) });
  const roles = data?.roles || data || [];

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => { qc.invalidateQueries(['roles']); toast.success('Role created'); setNewRole(''); },
    onError: err => toast.error(err.response?.data?.message || 'Failed to create role'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => { qc.invalidateQueries(['roles']); toast.success('Role deleted'); setDeleteId(null); },
    onError: err => toast.error(err.response?.data?.message || 'Failed to delete role'),
  });

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Roles</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="New role name..."
          style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none' }} />
        <Button icon={Plus} onClick={() => newRole.trim() && createMutation.mutate({ name: newRole.trim() })} loading={createMutation.isPending}>Add Role</Button>
      </div>
      {isLoading ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {roles.map((role) => (
            <div key={role.id || role.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{role.name || role.label}</span>
              {!['admin', 'manager', 'agent'].includes(role.name) && (
                <button onClick={() => setDeleteId(role.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}><Trash2 size={14} /></button>
              )}
            </div>
          ))}
          {roles.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No custom roles</div>}
        </div>
      )}
      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)} title="Delete Role"
        message="Delete this role? Users with this role will need reassignment." loading={deleteMutation.isPending} />
    </div>
  );
};

export default RoleManager;
