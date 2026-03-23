import React from 'react';
import { Search, X } from 'lucide-react';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants';

const LeadFilters = ({ filters, onChange, users = [], productTypes = [] }) => {
  const handleChange = (key, value) => onChange({ ...filters, [key]: value });
  const hasFilters = Object.values(filters).some(v => v);

  const selectStyle = { padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' };

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', padding: '16px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '16px' }}>
      <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          placeholder="Search by name, phone, email..."
          value={filters.search || ''}
          onChange={e => handleChange('search', e.target.value)}
          style={{ ...selectStyle, paddingLeft: '30px', width: '100%' }}
        />
      </div>
      <select value={filters.status || ''} onChange={e => handleChange('status', e.target.value)} style={selectStyle}>
        <option value="">All Statuses</option>
        {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <select value={filters.source || ''} onChange={e => handleChange('source', e.target.value)} style={selectStyle}>
        <option value="">All Sources</option>
        {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      {productTypes.length > 0 && (
        <select value={filters.productType || ''} onChange={e => handleChange('productType', e.target.value)} style={selectStyle}>
          <option value="">All Products</option>
          {productTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
        </select>
      )}
      {users.length > 0 && (
        <select value={filters.assignedTo || ''} onChange={e => handleChange('assignedTo', e.target.value)} style={selectStyle}>
          <option value="">All Agents</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      )}
      {hasFilters && (
        <button onClick={() => onChange({})} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '12px', cursor: 'pointer', background: '#fff', color: 'var(--text-muted)' }}>
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
};

export default LeadFilters;
