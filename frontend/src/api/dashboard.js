import client from './client';

export const getDashboardStats = (params) => client.get('/dashboard/stats', { params });
export const getPipelineData = (params) => client.get('/dashboard/pipeline', { params });
export const getPerformanceData = (params) => client.get('/dashboard/performance', { params });
export const getRecentActivities = (params) => client.get('/dashboard/recent-activities', { params });
