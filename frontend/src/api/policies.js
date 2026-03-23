import client from './client';

export const getPolicies = (params) => client.get('/policies', { params });
export const getPolicy = (id) => client.get(`/policies/${id}`);
export const createPolicy = (data) => client.post('/policies', data);
export const updatePolicy = (id, data) => client.put(`/policies/${id}`, data);
export const deletePolicy = (id) => client.delete(`/policies/${id}`);
export const getRenewalAlerts = (params) => client.get('/policies/renewals', { params });
