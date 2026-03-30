import client from './client';

export const getProductTypes = () => client.get('/config/product-types');
export const createProductType = (data) => client.post('/config/product-types', data);
export const updateProductType = (id, data) => client.put(`/config/product-types/${id}`, data);
export const deleteProductType = (id) => client.delete(`/config/product-types/${id}`);

export const getSubStatuses = (params) => client.get('/config/lead-sub-statuses', { params });
export const createSubStatus = (data) => client.post('/config/lead-sub-statuses', data);
export const updateSubStatus = (id, data) => client.put(`/config/lead-sub-statuses/${id}`, data);
export const deleteSubStatus = (id) => client.delete(`/config/lead-sub-statuses/${id}`);
