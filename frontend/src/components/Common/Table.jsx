import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const Table = ({ columns, data, loading, pagination, onPageChange, emptyMessage = 'No records found', stickyHeader }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'var(--bg)', position: stickyHeader ? 'sticky' : 'static', top: 0, zIndex: 1 }}>
            {columns.map((col) => (
              <th key={col.key || col.header} style={{
                padding: '10px 14px', textAlign: 'left', fontWeight: 600,
                color: 'var(--text-muted)', borderBottom: '2px solid var(--border)',
                whiteSpace: 'nowrap', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center' }}>
              <LoadingSpinner size={30} message="Loading data..." />
            </td></tr>
          ) : !data?.length ? (
            <tr><td colSpan={columns.length}>
              <EmptyState message={emptyMessage} />
            </td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                {columns.map((col) => (
                  <td key={col.key || col.header} style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {pagination.total > 0 ? `Showing ${Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}-${Math.min(pagination.page * pagination.pageSize, pagination.total)} of ${pagination.total}` : '0 results'}
          </span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1}
              style={{ padding: '4px 8px', border: '1px solid var(--border)', background: '#fff', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, idx) => {
              const p = pagination.page <= 3 ? idx + 1 : pagination.page - 2 + idx;
              if (p < 1 || p > (pagination.totalPages || 1)) return null;
              return (
                <button key={p} onClick={() => onPageChange(p)}
                  style={{ padding: '4px 10px', border: '1px solid var(--border)', background: p === pagination.page ? 'var(--primary)' : '#fff', color: p === pagination.page ? '#fff' : 'var(--text)', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: p === pagination.page ? 600 : 400 }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page >= (pagination.totalPages || 1)}
              style={{ padding: '4px 8px', border: '1px solid var(--border)', background: '#fff', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
