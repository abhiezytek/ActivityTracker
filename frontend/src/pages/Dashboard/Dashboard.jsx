import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Phone, TrendingUp, DollarSign, Plus, RefreshCw } from 'lucide-react';
import KPICard from './KPICard';
import PipelineChart from './PipelineChart';
import PerformanceChart from './PerformanceChart';
import ActivitySummary from './ActivitySummary';
import Button from '../../components/Common/Button';
import { useDashboardStats, usePipelineData, usePerformanceData, useRecentActivities } from '../../hooks/useDashboard';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { useQueryClient } from '@tanstack/react-query';
import './Dashboard.css';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('30');
  const navigate = useNavigate();
  const qc = useQueryClient();
  const params = { days: dateRange };

  const { data: stats, isLoading: statsLoading } = useDashboardStats(params);
  const { data: pipeline, isLoading: pipelineLoading } = usePipelineData(params);
  const { data: performance, isLoading: perfLoading } = usePerformanceData(params);
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities(params);

  const handleRefresh = () => qc.invalidateQueries(['dashboard']);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Welcome back! Here's your sales overview.
          </p>
        </div>
        <div className="dashboard-actions">
          <div className="date-filter">
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">This year</option>
            </select>
          </div>
          <Button variant="secondary" icon={RefreshCw} size="sm" onClick={handleRefresh}>Refresh</Button>
          <Button icon={Plus} size="sm" onClick={() => navigate('/leads/new')}>New Lead</Button>
          <Button variant="ghost" icon={Plus} size="sm" onClick={() => navigate('/activities/new')}>Log Activity</Button>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard
          title="Total Leads"
          value={stats?.totalLeads ?? '—'}
          icon={Users}
          color="#1e40af"
          trend={stats?.leadsTrend}
          trendLabel="vs last period"
          loading={statsLoading}
        />
        <KPICard
          title="Today's Activities"
          value={stats?.todayActivities ?? '—'}
          icon={Activity}
          color="#8b5cf6"
          trend={stats?.activitiesTrend}
          trendLabel="vs yesterday"
          loading={statsLoading}
        />
        <KPICard
          title="Calls Made"
          value={stats?.callsMade ?? '—'}
          icon={Phone}
          color="#0ea5e9"
          loading={statsLoading}
        />
        <KPICard
          title="Conversion Rate"
          value={stats?.conversionRate !== undefined ? formatPercent(stats.conversionRate) : '—'}
          icon={TrendingUp}
          color="#16a34a"
          trend={stats?.conversionTrend}
          trendLabel="vs last period"
          loading={statsLoading}
        />
        <KPICard
          title="Premium Generated"
          value={stats?.premiumGenerated !== undefined ? formatCurrency(stats.premiumGenerated) : '—'}
          icon={DollarSign}
          color="#d97706"
          trend={stats?.premiumTrend}
          trendLabel="vs last period"
          loading={statsLoading}
        />
      </div>

      <div className="charts-grid">
        <PipelineChart data={pipeline?.stages} loading={pipelineLoading} />
        <PerformanceChart data={performance?.data} loading={perfLoading} />
      </div>

      <div className="bottom-grid">
        <ActivitySummary activities={recentActivities?.activities} loading={activitiesLoading} />
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Quick Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'New Leads', value: stats?.newLeads ?? 0, color: '#3b82f6' },
              { label: 'In Progress', value: stats?.inProgressLeads ?? 0, color: '#f59e0b' },
              { label: 'Closed Won', value: stats?.closedWon ?? 0, color: '#16a34a' },
              { label: 'Closed Lost', value: stats?.closedLost ?? 0, color: '#dc2626' },
              { label: 'Policies Active', value: stats?.activePolicies ?? 0, color: '#0ea5e9' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: item.color }}>{statsLoading ? '...' : item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
