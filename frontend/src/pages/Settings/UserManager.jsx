import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users';
import { useForm } from 'react-hook-form';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import Badge from '../../components/Common/Badge';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none', marginBottom: '12px' };

const UserManager = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => getUsers().then(r => r.data) });
  const users = data?.users || data || [];

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success('User created'); setShowForm(false); reset(); },
    onError: err => toast.error(err.response?.data?.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success('User updated'); setEditUser(null); },
    onError: err => toast.error(err.response?.data?.message || 'Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success('User deleted'); setDeleteId(null); },
    onError: err => toast.error(err.response?.data?.message || 'Failed to delete user'),
  });

  const onSubmit = (data) => {
    if (editUser) updateMutation.mutate({ id: editUser.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Users ({users.length})</h3>
        <Button icon={Plus} size="sm" onClick={() => { setEditUser(null); reset({}); setShowForm(true); }}>Add User</Button>
      </div>
      {isLoading ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> : (
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Name', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '2px solid var(--border)', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '10px 14px' }}><Badge value={u.role} /></td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => { setEditUser(u); reset({ name: u.name, email: u.email, role: u.role }); setShowForm(true); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)', padding: '4px' }}><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteId(u.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editUser ? 'Edit User' : 'Add User'} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button form="user-form" type="submit" loading={createMutation.isPending || updateMutation.isPending}>Save</Button>
        </>}>
        <form id="user-form" onSubmit={handleSubmit(onSubmit)}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>Full Name *</label>
          <input {...register('name', { required: true })} placeholder="John Smith" style={inputStyle} />
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>Email *</label>
          <input type="email" {...register('email', { required: true })} placeholder="john@example.com" style={inputStyle} />
          {!editUser && <>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>Password *</label>
            <input type="password" {...register('password', { required: !editUser })} placeholder="••••••••" style={inputStyle} />
          </>}
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>Role</label>
          <select {...register('role')} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="agent">Agent</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrator</option>
          </select>
        </form>
      </Modal>
      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)} title="Delete User"
        message="Are you sure you want to delete this user?" loading={deleteMutation.isPending} />
    </div>
  );
};

export default UserManager;
