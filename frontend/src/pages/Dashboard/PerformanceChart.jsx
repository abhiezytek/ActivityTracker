import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const PerformanceChart = ({ data, loading }) => {
  const chartData = data || [];

  const formatCurrency = (v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`;

  return (
    <Card title="Premium Performance (Last 30 Days)" style={{ height: '100%' }}>
      {loading ? (
        <LoadingSpinner fullPage />
      ) : chartData.length === 0 ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          No performance data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              formatter={(v) => [`$${v?.toLocaleString()}`, 'Premium']}
            />
            <Line type="monotone" dataKey="premium" stroke="#1e40af" strokeWidth={2} dot={{ r: 3, fill: '#1e40af' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default PerformanceChart;
