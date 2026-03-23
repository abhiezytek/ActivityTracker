import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, Phone, Mail, MapPin, User, Calendar, DollarSign } from 'lucide-react';
import { useLead } from '../../hooks/useLeads';
import { useLeadActivities } from '../../hooks/useActivities';
import Badge from '../../components/Common/Badge';
import Button from '../../components/Common/Button';
import Card from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ActivityTimeline from '../Activities/ActivityTimeline';
import ActivityForm from '../Activities/ActivityForm';
import { formatDate, formatCurrency, formatPhone } from '../../utils/formatters';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
    <Icon size={16} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
    <div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '14px', marginTop: '2px', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  </div>
);

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showActivityForm, setShowActivityForm] = useState(false);

  const { data: leadData, isLoading } = useLead(id);
  const { data: activitiesData, isLoading: activitiesLoading } = useLeadActivities(id);

  const lead = leadData?.lead || leadData;
  const activities = activitiesData?.activities || activitiesData || [];

  if (isLoading) return <LoadingSpinner fullPage message="Loading lead..." />;
  if (!lead) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Lead not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/leads')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '22px' }}>{lead.customerName || lead.customer_name}</h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
              <Badge value={lead.status} />
              {lead.subStatus && <Badge value={lead.subStatus.name} bg="#f1f5f9" color="var(--text)" />}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" icon={Plus} onClick={() => setShowActivityForm(true)}>Log Activity</Button>
          <Button icon={Edit2} onClick={() => navigate(`/leads/${id}/edit`)}>Edit Lead</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Contact Information">
            <InfoRow icon={Phone} label="Phone" value={formatPhone(lead.phone)} />
            <InfoRow icon={Mail} label="Email" value={lead.email} />
            <InfoRow icon={User} label="Assigned To" value={lead.assignedTo?.name || 'Unassigned'} />
          </Card>
          <Card title="Lead Information">
            <InfoRow icon={Calendar} label="Created" value={formatDate(lead.createdAt)} />
            <InfoRow icon={Calendar} label="Last Updated" value={formatDate(lead.updatedAt)} />
            <InfoRow icon={DollarSign} label="Expected Premium" value={lead.expectedPremium ? formatCurrency(lead.expectedPremium) : null} />
            {lead.productType && <InfoRow icon={MapPin} label="Product Type" value={lead.productType.name} />}
            <InfoRow icon={MapPin} label="Source" value={lead.source?.replace(/_/g,' ')} />
          </Card>
          {lead.notes && (
            <Card title="Notes">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{lead.notes}</p>
            </Card>
          )}
        </div>

        <div>
          <Card title={`Activities (${activities.length})`} actions={
            <Button size="sm" icon={Plus} onClick={() => setShowActivityForm(true)}>Log Activity</Button>
          }>
            <ActivityTimeline activities={activities} loading={activitiesLoading} />
          </Card>
        </div>
      </div>

      {showActivityForm && (
        <ActivityForm
          isOpen={showActivityForm}
          onClose={() => setShowActivityForm(false)}
          defaultLeadId={id}
        />
      )}
    </div>
  );
};

export default LeadDetail;
