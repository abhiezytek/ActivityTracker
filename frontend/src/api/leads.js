import client from './client';

export const getLeads = (params) => client.get('/leads', { params });
export const getLead = (id) => client.get(`/leads/${id}`);
export const createLead = (data) => client.post('/leads', data);
export const updateLead = (id, data) => client.put(`/leads/${id}`, data);
export const deleteLead = (id) => client.delete(`/leads/${id}`);
export const assignLead = (id, userId) => client.post(`/leads/${id}/assign`, { userId });
export const uploadLeads = (formData) => client.post('/leads/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const downloadLeadTemplate = () => client.get('/leads/template', { responseType: 'blob' });
