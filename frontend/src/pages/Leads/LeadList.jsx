import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Eye, Edit2, Trash2 } from 'lucide-react';
import { useLeads, useDeleteLead } from '../../hooks/useLeads';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/users';
import { getProductTypes } from '../../api/config';
import Badge from '../../components/Common/Badge';
import Table from '../../components/Common/Table';
import Button from '../../components/Common/Button';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LeadFilters from './LeadFilters';
import { formatDate, formatPhone } from '../../utils/formatters';
import './LeadList.css';

const LeadList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const pageSize = 20;

  const { data, isLoading } = useLeads({ ...filters, page, pageSize });
  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => getUsers().then(r => r.data) });
  const { data: productTypesData } = useQuery({ queryKey: ['product-types'], queryFn: () => getProductTypes().then(r => r.data) });
  const deleteMutation = useDeleteLead();

  const leads = data?.leads || data?.data || [];
  const total = data?.total || 0;
  const users = usersData?.users || usersData || [];
  const productTypes = productTypesData?.productTypes || productTypesData || [];

  const handleFiltersChange = (newFilters) => { setFilters(newFilters); setPage(1); };

  const columns = [
    { key: 'name', header: 'Name', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 500 }}>{row.customerName || row.customer_name || v}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatPhone(row.phone)}</div>
      </div>
    )},
    { key: 'email', header: 'Email', render: (v) => <span style={{ fontSize: '12px' }}>{v || '—'}</span> },
    { key: 'productType', header: 'Product', render: (v, row) => <span style={{ fontSize: '12px' }}>{v?.name || row.productTypeName || '—'}</span> },
    { key: 'source', header: 'Source', render: (v) => <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>{v?.replace(/_/g,' ') || '—'}</span> },
    { key: 'status', header: 'Status', render: (v) => <Badge value={v} /> },
    { key: 'assignedTo', header: 'Assigned To', render: (v, row) => <span style={{ fontSize: '12px' }}>{v?.name || row.assignedToName || '—'}</span> },
    { key: 'createdAt', header: 'Created', render: (v) => <span style={{ fontSize: '12px' }}>{formatDate(v)}</span> },
    { key: 'actions', header: 'Actions', render: (_, row) => (
      <div style={{ display: 'flex', gap: '2px' }}>
        <button title="View" onClick={() => navigate(`/leads/${row.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px', borderRadius: '4px' }}>
          <Eye size={14} />
        </button>
        <button title="Edit" onClick={() => navigate(`/leads/${row.id}/edit`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)', padding: '4px', borderRadius: '4px' }}>
          <Edit2 size={14} />
        </button>
        <button title="Delete" onClick={() => setDeleteId(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px', borderRadius: '4px' }}>
          <Trash2 size={14} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="lead-list">
      <div className="lead-list-header">
        <div>
          <h1>Leads</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{total} total leads</p>
        </div>
        <div className="lead-list-actions">
          <Button variant="secondary" icon={Upload} size="sm" onClick={() => navigate('/leads/upload')}>Upload Leads</Button>
          <Button icon={Plus} size="sm" onClick={() => navigate('/leads/new')}>Add Lead</Button>
        </div>
      </div>

      <LeadFilters filters={filters} onChange={handleFiltersChange} users={users} productTypes={productTypes} />

      <div className="lead-table-wrapper" style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={leads}
          loading={isLoading}
          pagination={{ page, pageSize, total, totalPages: Math.ceil(total / pageSize) }}
          onPageChange={setPage}
          emptyMessage="No leads found. Create your first lead!"
        />
      </div>

      <div className="lead-cards">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No leads found</div>
        ) : leads.map(lead => (
          <div key={lead.id} className="lead-card">
            <div className="lead-card-header">
              <div>
                <div className="lead-card-name">{lead.customerName || lead.customer_name}</div>
                <div className="lead-card-meta">{formatPhone(lead.phone)} • {lead.email}</div>
              </div>
              <Badge value={lead.status} />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>{lead.productType?.name || '—'}</span>
              <span>•</span>
              <span style={{ textTransform: 'capitalize' }}>{lead.source?.replace(/_/g,' ')}</span>
              <span>•</span>
              <span>{formatDate(lead.createdAt)}</span>
            </div>
            <div className="lead-card-footer">
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.assignedTo?.name || 'Unassigned'}</span>
              <div className="lead-card-actions">
                <button onClick={() => navigate(`/leads/${lead.id}`)} style={{ padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={12} /> View
                </button>
                <button onClick={() => navigate(`/leads/${lead.id}/edit`)} style={{ padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setDeleteId(lead.id)} style={{ padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => { await deleteMutation.mutateAsync(deleteId); setDeleteId(null); }}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This will also delete all associated activities. This action cannot be undone."
        loading={deleteMutation.isPending}
        confirmLabel="Delete Lead"
      />
    </div>
  );
};

export default LeadList;
