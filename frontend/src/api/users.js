import client from './client';

export const getUsers = (params) => client.get('/users', { params });
export const getUser = (id) => client.get(`/users/${id}`);
export const createUser = (data) => client.post('/users', data);
export const updateUser = (id, data) => client.put(`/users/${id}`, data);
export const deleteUser = (id) => client.delete(`/users/${id}`);
export const getRoles = () => client.get('/roles');
export const createRole = (data) => client.post('/roles', data);
export const deleteRole = (id) => client.delete(`/roles/${id}`);
