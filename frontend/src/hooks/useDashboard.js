import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getPipelineData, getPerformanceData, getRecentActivities } from '../api/dashboard';

export const useDashboardStats = (params = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'stats', params],
    queryFn: () => getDashboardStats(params).then(r => r.data),
    refetchInterval: 300000,
  });
};

export const usePipelineData = (params = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'pipeline', params],
    queryFn: () => getPipelineData(params).then(r => r.data),
    refetchInterval: 300000,
  });
};

export const usePerformanceData = (params = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'performance', params],
    queryFn: () => getPerformanceData(params).then(r => r.data),
  });
};

export const useRecentActivities = (params = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-activities', params],
    queryFn: () => getRecentActivities(params).then(r => r.data),
    refetchInterval: 60000,
  });
};
