import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPolicies } from '../../api/policies';
import Badge from '../../components/Common/Badge';
import Table from '../../components/Common/Table';
import Button from '../../components/Common/Button';
import RenewalAlerts from './RenewalAlerts';
import { formatDate, formatCurrency } from '../../utils/formatters';

const PolicyList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [renewalFilter, setRenewalFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['policies', { page, renewalFilter }],
    queryFn: () => getPolicies({ page, pageSize: 20, renewalDays: renewalFilter }).then(r => r.data),
  });

  const policies = data?.policies || data?.data || [];
  const total = data?.total || 0;

  const columns = [
    { key: 'policyNumber', header: 'Policy #', render: v => <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>{v || '—'}</span> },
    { key: 'customer', header: 'Customer', render: (v, row) => <span style={{ fontWeight: 500 }}>{v?.name || row.customerName || row.lead?.customerName || '—'}</span> },
    { key: 'productType', header: 'Product', render: (v, row) => v?.name || row.productTypeName || '—' },
    { key: 'premium', header: 'Premium', render: v => <span style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(v)}</span> },
    { key: 'startDate', header: 'Start Date', render: v => <span style={{ fontSize: '12px' }}>{formatDate(v)}</span> },
    { key: 'endDate', header: 'End Date', render: v => <span style={{ fontSize: '12px' }}>{formatDate(v)}</span> },
    { key: 'agent', header: 'Agent', render: (v, row) => v?.name || row.agentName || '—' },
    { key: 'status', header: 'Status', render: v => <Badge value={v} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px' }}>Policies</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{total} total policies</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={renewalFilter} onChange={e => setRenewalFilter(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' }}>
            <option value="">All Policies</option>
            <option value="30">Renewing in 30 days</option>
            <option value="60">Renewing in 60 days</option>
            <option value="90">Renewing in 90 days</option>
          </select>
          <Button icon={Plus} size="sm" onClick={() => navigate('/policies/new')}>Add Policy</Button>
        </div>
      </div>
      <RenewalAlerts />
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <Table columns={columns} data={policies} loading={isLoading}
          pagination={{ page, pageSize: 20, total, totalPages: Math.ceil(total / 20) }}
          onPageChange={setPage} emptyMessage="No policies found." />
      </div>
    </div>
  );
};

export default PolicyList;
