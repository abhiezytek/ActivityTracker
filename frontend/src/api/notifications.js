import client from './client';

export const getNotifications = (params) => client.get('/notifications', { params });
export const markAsRead = (id) => client.patch(`/notifications/${id}/read`);
export const markAllRead = () => client.patch('/notifications/read-all');
export const deleteNotification = (id) => client.delete(`/notifications/${id}`);
export const getUnreadCount = () => client.get('/notifications/unread-count');
