import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateLead, useUpdateLead, useLead } from '../../hooks/useLeads';
import { getUsers } from '../../api/users';
import { getProductTypes, getSubStatuses } from '../../api/config';
import Button from '../../components/Common/Button';
import Card from '../../components/Common/Card';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants';

const schema = yup.object({
  customerName: yup.string().required('Customer name is required'),
  phone: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').nullable(),
  status: yup.string().required('Status is required'),
  source: yup.string().required('Source is required'),
});

const fieldStyle = { marginBottom: '16px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none' };
const selectStyle = { ...inputStyle, cursor: 'pointer' };
const errorStyle = { color: 'var(--danger)', fontSize: '12px', marginTop: '4px' };

const LeadForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('new');

  const { data: leadData, isLoading: leadLoading } = useLead(id);
  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => getUsers().then(r => r.data) });
  const { data: productTypesData } = useQuery({ queryKey: ['product-types'], queryFn: () => getProductTypes().then(r => r.data) });
  const { data: subStatusesData } = useQuery({
    queryKey: ['sub-statuses', selectedStatus],
    queryFn: () => getSubStatuses({ status: selectedStatus }).then(r => r.data),
    enabled: Boolean(selectedStatus),
  });

  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: 'new', source: 'website' },
  });

  const statusValue = watch('status');
  useEffect(() => { setSelectedStatus(statusValue); }, [statusValue]);

  useEffect(() => {
    if (isEdit && leadData) {
      const lead = leadData.lead || leadData;
      reset({
        customerName: lead.customerName || lead.customer_name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        status: lead.status || 'new',
        source: lead.source || 'website',
        productTypeId: lead.productTypeId || lead.product_type_id || '',
        assignedToId: lead.assignedToId || lead.assigned_to_id || '',
        subStatusId: lead.subStatusId || lead.sub_status_id || '',
        notes: lead.notes || '',
        expectedPremium: lead.expectedPremium || lead.expected_premium || '',
      });
      setSelectedStatus(lead.status || 'new');
    }
  }, [isEdit, leadData, reset]);

  const users = usersData?.users || usersData || [];
  const productTypes = productTypesData?.productTypes || productTypesData || [];
  const subStatuses = subStatusesData?.subStatuses || subStatusesData || [];

  const onSubmit = async (data) => {
    try {
      const payload = {
        customer_name: data.customerName,
        phone: data.phone,
        email: data.email || undefined,
        status: data.status,
        source: data.source,
        product_type_id: data.productTypeId || undefined,
        assigned_to: data.assignedToId || undefined,
        notes: data.notes || undefined,
        expected_premium: data.expectedPremium || undefined,
      };
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate('/leads');
    } catch (err) {
      // mutation errors are already handled by onError (toast notification);
      // log unexpected errors for debugging
      console.error('LeadForm submit error:', err);
    }
  };

  if (isEdit && leadLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const FormField = ({ label, error, children, required }) => (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}{required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}</label>
      {children}
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/leads')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', padding: 0 }}>
          <ArrowLeft size={16} /> Back to Leads
        </button>
      </div>
      <h1 style={{ fontSize: '22px', marginBottom: '24px' }}>{isEdit ? 'Edit Lead' : 'Create New Lead'}</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Card title="Customer Information" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <FormField label="Customer Name" error={errors.customerName?.message} required>
                <input {...register('customerName')} placeholder="John Smith" style={{ ...inputStyle, borderColor: errors.customerName ? 'var(--danger)' : 'var(--border)' }} />
              </FormField>
              <FormField label="Phone Number" error={errors.phone?.message} required>
                <input {...register('phone')} placeholder="+1 (555) 000-0000" style={{ ...inputStyle, borderColor: errors.phone ? 'var(--danger)' : 'var(--border)' }} />
              </FormField>
              <FormField label="Email Address" error={errors.email?.message}>
                <input {...register('email')} type="email" placeholder="john@example.com" style={{ ...inputStyle, borderColor: errors.email ? 'var(--danger)' : 'var(--border)' }} />
              </FormField>
              <FormField label="Expected Premium">
                <input {...register('expectedPremium')} type="number" placeholder="0.00" style={inputStyle} />
              </FormField>
            </div>
          </Card>

          <Card title="Lead Details">
            <FormField label="Status" required>
              <select {...register('status')} style={selectStyle}>
                {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FormField>
            {subStatuses.length > 0 && (
              <FormField label="Sub-Status">
                <select {...register('subStatusId')} style={selectStyle}>
                  <option value="">Select sub-status</option>
                  {subStatuses.map(ss => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
                </select>
              </FormField>
            )}
            <FormField label="Source" required>
              <select {...register('source')} style={selectStyle}>
                <option value="">Select source</option>
                {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FormField>
            <FormField label="Product Type">
              <select {...register('productTypeId')} style={selectStyle}>
                <option value="">Select product</option>
                {productTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
            </FormField>
          </Card>

          <Card title="Assignment">
            <FormField label="Assign To">
              <select {...register('assignedToId')} style={selectStyle}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </FormField>
            <FormField label="Notes">
              <textarea {...register('notes')} placeholder="Add any notes about this lead..." rows={5} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </FormField>
          </Card>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button variant="secondary" type="button" onClick={() => navigate('/leads')}>Cancel</Button>
          <Button type="submit" icon={Save} loading={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
