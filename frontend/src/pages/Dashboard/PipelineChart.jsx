import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#16a34a', '#dc2626'];

const PipelineChart = ({ data, loading }) => {
  const chartData = data || [
    { status: 'New', count: 0 }, { status: 'Contacted', count: 0 },
    { status: 'Qualified', count: 0 }, { status: 'Proposal', count: 0 },
    { status: 'Closed Won', count: 0 },
  ];

  return (
    <Card title="Pipeline Overview" style={{ height: '100%' }}>
      {loading ? (
        <LoadingSpinner fullPage />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default PipelineChart;
