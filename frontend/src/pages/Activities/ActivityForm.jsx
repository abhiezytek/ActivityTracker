import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MapPin, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCreateActivity } from '../../hooks/useActivities';
import { getLeads } from '../../api/leads';
import Modal from '../../components/Common/Modal';
import Button from '../../components/Common/Button';
import { ACTIVITY_TYPES, ACTIVITY_OUTCOMES } from '../../utils/constants';

const schema = yup.object({
  leadId: yup.string().required('Lead is required'),
  type: yup.string().required('Activity type is required'),
  activityDate: yup.string().required('Date is required'),
});

const selectStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none' };
const fieldStyle = { marginBottom: '16px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' };

const ActivityForm = ({ isOpen, onClose, defaultLeadId }) => {
  const createMutation = useCreateActivity();
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { data: leadsData } = useQuery({
    queryKey: ['leads-all'],
    queryFn: () => getLeads({ pageSize: 100 }).then(r => r.data),
  });

  const leads = leadsData?.leads || leadsData?.data || [];

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      leadId: defaultLeadId || '',
      type: 'call',
      activityDate: new Date().toISOString().slice(0, 16),
      outcome: '',
      duration: '',
      notes: '',
      scheduled: false,
    },
  });

  const captureLocation = () => {
    setGettingLocation(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGettingLocation(false); },
      () => { setGettingLocation(false); alert('Unable to get location'); }
    );
  };

  const onSubmit = async (data) => {
    await createMutation.mutateAsync({ ...data, location });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Activity" size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
          <Button icon={Save} form="activity-form" type="submit" loading={createMutation.isPending}>Save Activity</Button>
        </>
      }
    >
      <form id="activity-form" onSubmit={handleSubmit(onSubmit)}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Lead <span style={{ color: 'var(--danger)' }}>*</span></label>
          <select {...register('leadId')} style={{ ...selectStyle, borderColor: errors.leadId ? 'var(--danger)' : 'var(--border)' }}>
            <option value="">Select lead...</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.customerName || l.customer_name}</option>)}
          </select>
          {errors.leadId && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.leadId.message}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Activity Type <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select {...register('type')} style={selectStyle}>
              {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Outcome</label>
            <select {...register('outcome')} style={selectStyle}>
              <option value="">Select outcome</option>
              {ACTIVITY_OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Date & Time <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="datetime-local" {...register('activityDate')} style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Duration (minutes)</label>
            <input type="number" {...register('duration')} placeholder="30" min="1" max="480" style={inputStyle} />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Notes</label>
          <textarea {...register('notes')} rows={3} placeholder="Add notes about this activity..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={captureLocation} disabled={gettingLocation}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: `1px solid ${location ? 'var(--success)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: location ? 'var(--success-light)' : '#fff', color: location ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>
            <MapPin size={14} />
            {gettingLocation ? 'Getting location...' : location ? `Location captured (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Capture Location'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <input type="checkbox" id="scheduled" {...register('scheduled')} />
            <label htmlFor="scheduled">Schedule for later (reminder)</label>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ActivityForm;
