import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { getProductTypes, createProductType, updateProductType, deleteProductType } from '../../api/config';
import Button from '../../components/Common/Button';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { toast } from 'react-toastify';

const ProductTypeManager = () => {
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['product-types'], queryFn: () => getProductTypes().then(r => r.data) });
  const items = data?.productTypes || data || [];

  const createMutation = useMutation({
    mutationFn: createProductType,
    onSuccess: () => { qc.invalidateQueries(['product-types']); toast.success('Product type created'); setNewName(''); },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProductType(id, data),
    onSuccess: () => { qc.invalidateQueries(['product-types']); toast.success('Updated'); setEditItem(null); },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductType,
    onSuccess: () => { qc.invalidateQueries(['product-types']); toast.success('Deleted'); setDeleteId(null); },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Product Types</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Life Insurance, Health, Auto..."
          style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none' }} />
        <Button icon={Plus} onClick={() => newName.trim() && createMutation.mutate({ name: newName.trim() })} loading={createMutation.isPending}>Add</Button>
      </div>
      {isLoading ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              {editItem?.id === item.id ? (
                <>
                  <input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                    style={{ flex: 1, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', outline: 'none', marginRight: '6px' }} />
                  <button onClick={() => updateMutation.mutate({ id: item.id, data: { name: editItem.name } })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)', padding: '2px' }}>✓</button>
                  <button onClick={() => setEditItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '2px' }}>✗</button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setEditItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)', padding: '4px' }}><Edit2 size={12} /></button>
                    <button onClick={() => setDeleteId(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}><Trash2 size={12} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1/-1' }}>No product types yet</div>}
        </div>
      )}
      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)} title="Delete Product Type"
        message="Delete this product type?" loading={deleteMutation.isPending} />
    </div>
  );
};

export default ProductTypeManager;
