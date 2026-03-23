import client from './client';

export const login = (credentials) => client.post('/auth/login', credentials);
export const logout = () => client.post('/auth/logout');
export const getProfile = () => client.get('/auth/profile');
export const updateProfile = (data) => client.put('/auth/profile', data);
export const changePassword = (data) => client.post('/auth/change-password', data);
