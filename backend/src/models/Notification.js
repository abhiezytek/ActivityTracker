const { query } = require('../config/db');

const Notification = {
  async findByUser(userId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const countRows = await query(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?',
      [userId]
    );
    const total = countRows[0].total;

    const unreadRows = await query(
      "SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND status = 'unread'",
      [userId]
    );
    const unread_count = unreadRows[0].unread_count;

    const data = await query(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY CASE WHEN status = 'unread' THEN 0 ELSE 1 END, created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return { data, total, unread_count };
  },

  async create(userId, message, type = 'general') {
    const result = await query(
      "INSERT INTO notifications (user_id, message, type, status) VALUES (?, ?, ?, 'unread')",
      [userId, message, type]
    );
    const rows = await query('SELECT * FROM notifications WHERE notification_id = ?', [result.insertId]);
    return rows[0] || null;
  },

  async markRead(id, userId) {
    await query(
      "UPDATE notifications SET status = 'read' WHERE notification_id = ? AND user_id = ?",
      [id, userId]
    );
    const rows = await query('SELECT * FROM notifications WHERE notification_id = ?', [id]);
    return rows[0] || null;
  },

  async markAllRead(userId) {
    const result = await query(
      "UPDATE notifications SET status = 'read' WHERE user_id = ? AND status = 'unread'",
      [userId]
    );
    return result.affectedRows;
  },

  async remove(id, userId) {
    await query('DELETE FROM notifications WHERE notification_id = ? AND user_id = ?', [id, userId]);
    return true;
  }
};

module.exports = Notification;
