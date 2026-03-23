const { query } = require('../config/db');

const Activity = {
  async findById(id) {
    const rows = await query(
      `SELECT a.*, l.customer_name, u.name AS agent_name
       FROM activities a
       JOIN leads l ON a.lead_id = l.lead_id
       JOIN users u ON a.user_id = u.user_id
       WHERE a.activity_id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    const params = [];

    if (filters.lead_id) { whereClauses.push('a.lead_id = ?'); params.push(filters.lead_id); }
    if (filters.user_id) { whereClauses.push('a.user_id = ?'); params.push(filters.user_id); }
    if (filters.activity_type) { whereClauses.push('a.activity_type = ?'); params.push(filters.activity_type); }
    if (filters.date_from) { whereClauses.push('a.activity_date >= ?'); params.push(filters.date_from); }
    if (filters.date_to) { whereClauses.push('a.activity_date <= ?'); params.push(filters.date_to); }
    if (filters.branch_users && filters.branch_users.length) {
      whereClauses.push(`a.user_id IN (${filters.branch_users.map(() => '?').join(',')})`);
      params.push(...filters.branch_users);
    }

    const where = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM activities a ${where}`,
      params
    );
    const total = countRows[0].total;

    const data = await query(
      `SELECT a.*, l.customer_name, u.name AS agent_name
       FROM activities a
       JOIN leads l ON a.lead_id = l.lead_id
       JOIN users u ON a.user_id = u.user_id
       ${where}
       ORDER BY a.activity_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { data, total };
  },

  async create(data) {
    const result = await query(
      `INSERT INTO activities (lead_id, user_id, activity_type, activity_date, duration_minutes, outcome, notes, location_lat, location_long, is_scheduled, reminder_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.lead_id,
        data.user_id,
        data.activity_type,
        data.activity_date,
        data.duration_minutes || null,
        data.outcome || null,
        data.notes || null,
        data.location_lat || null,
        data.location_long || null,
        data.is_scheduled ? 1 : 0,
        data.reminder_at || null
      ]
    );
    return Activity.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowed = ['activity_type', 'activity_date', 'duration_minutes', 'outcome', 'notes', 'location_lat', 'location_long', 'is_scheduled', 'reminder_at'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (!fields.length) return Activity.findById(id);

    params.push(id);
    await query(`UPDATE activities SET ${fields.join(', ')} WHERE activity_id = ?`, params);
    return Activity.findById(id);
  },

  async remove(id) {
    await query('DELETE FROM activities WHERE activity_id = ?', [id]);
    return true;
  }
};

module.exports = Activity;
