import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPolicy } from '../../api/policies';
import { getLeads } from '../../api/leads';
import { getProductTypes } from '../../api/config';
import { getUsers } from '../../api/users';
import Button from '../../components/Common/Button';
import Card from '../../components/Common/Card';
import { toast } from 'react-toastify';

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none' };
const selectStyle = { ...inputStyle, cursor: 'pointer' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' };

const PolicyForm = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm();

  const { data: leadsData } = useQuery({ queryKey: ['leads-all'], queryFn: () => getLeads({ pageSize: 200 }).then(r => r.data) });
  const { data: productTypesData } = useQuery({ queryKey: ['product-types'], queryFn: () => getProductTypes().then(r => r.data) });
  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => getUsers().then(r => r.data) });

  const mutation = useMutation({
    mutationFn: createPolicy,
    onSuccess: () => { qc.invalidateQueries(['policies']); toast.success('Policy created'); navigate('/policies'); },
    onError: err => toast.error(err.response?.data?.message || 'Failed to create policy'),
  });

  const leads = leadsData?.leads || leadsData?.data || [];
  const productTypes = productTypesData?.productTypes || productTypesData || [];
  const users = usersData?.users || usersData || [];

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div style={{ maxWidth: '700px' }}>
      <button onClick={() => navigate('/policies')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Policies
      </button>
      <h1 style={{ fontSize: '22px', marginBottom: '24px' }}>Create Policy</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card title="Policy Details" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {[
              { name: 'policyNumber', label: 'Policy Number', placeholder: 'POL-001', required: true },
              { name: 'premium', label: 'Premium Amount', type: 'number', placeholder: '0.00', required: true },
              { name: 'startDate', label: 'Start Date', type: 'date', required: true },
              { name: 'endDate', label: 'End Date', type: 'date', required: true },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>{f.label}{f.required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}</label>
                <input type={f.type || 'text'} {...register(f.name, { required: f.required })} placeholder={f.placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Lead</label>
              <select {...register('leadId')} style={selectStyle}>
                <option value="">Select lead</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.customerName || l.customer_name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Product Type</label>
              <select {...register('productTypeId')} style={selectStyle}>
                <option value="">Select product</option>
                {productTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Agent</label>
              <select {...register('agentId')} style={selectStyle}>
                <option value="">Select agent</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Status</label>
              <select {...register('status')} style={selectStyle}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" type="button" onClick={() => navigate('/policies')}>Cancel</Button>
          <Button type="submit" icon={Save} loading={mutation.isPending}>Create Policy</Button>
        </div>
      </form>
    </div>
  );
};

export default PolicyForm;
