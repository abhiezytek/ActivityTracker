import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../../hooks/useLeads';
import Badge from '../../components/Common/Badge';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { PIPELINE_STAGES } from '../../utils/constants';

const Pipeline = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useLeads({ pageSize: 200 });
  const leads = data?.leads || data?.data || [];

  const getStageLeads = (stageId) => leads.filter(l => l.status === stageId);
  const getStagePremium = (stageLeads) => stageLeads.reduce((sum, l) => sum + (Number(l.expectedPremium || l.expected_premium) || 0), 0);

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px' }}>Pipeline</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Kanban view of your sales pipeline</p>
      </div>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', minHeight: '500px' }}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = getStageLeads(stage.id);
          const premium = getStagePremium(stageLeads);
          return (
            <div key={stage.id} style={{ minWidth: '240px', flex: '1', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{stage.label}</span>
                </div>
                <span style={{ background: stage.color + '20', color: stage.color, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>{stageLeads.length}</span>
              </div>
              {premium > 0 && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{formatCurrency(premium)}</div>}
              {stageLeads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px', border: '2px dashed var(--border)', borderRadius: 'var(--radius)' }}>No leads</div>
              ) : stageLeads.map(lead => (
                <div key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}
                  style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px', cursor: 'pointer', transition: 'var(--transition)', boxShadow: 'var(--shadow)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
                  <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>{lead.customerName || lead.customer_name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{lead.phone}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lead.productType?.name || '—'}</span>
                    {lead.expectedPremium && <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(lead.expectedPremium)}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
