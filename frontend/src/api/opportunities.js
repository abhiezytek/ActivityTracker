import client from './client';

export const getOpportunities = (params) => client.get('/opportunities', { params });
export const getOpportunity = (id) => client.get(`/opportunities/${id}`);
export const createOpportunity = (data) => client.post('/opportunities', data);
export const updateOpportunity = (id, data) => client.put(`/opportunities/${id}`, data);
export const deleteOpportunity = (id) => client.delete(`/opportunities/${id}`);
