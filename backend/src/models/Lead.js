const { query } = require('../config/db');

const Lead = {
  async findById(id) {
    const rows = await query(
      `SELECT l.*, u.name AS assigned_agent_name, pt.name AS product_type_name
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.user_id
       LEFT JOIN product_types pt ON l.product_type_id = pt.product_type_id
       WHERE l.lead_id = ? AND l.is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  },

  async findWithActivities(id) {
    const lead = await Lead.findById(id);
    if (!lead) return null;
    const activities = await query(
      `SELECT a.*, u.name AS agent_name
       FROM activities a
       JOIN users u ON a.user_id = u.user_id
       WHERE a.lead_id = ?
       ORDER BY a.activity_date DESC`,
      [id]
    );
    lead.activities = activities;
    return lead;
  },

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    let whereClauses = ['l.is_deleted = 0'];
    const params = [];

    if (filters.status) { whereClauses.push('l.status = ?'); params.push(filters.status); }
    if (filters.product_type_id) { whereClauses.push('l.product_type_id = ?'); params.push(filters.product_type_id); }
    if (filters.assigned_to) { whereClauses.push('l.assigned_to = ?'); params.push(filters.assigned_to); }
    if (filters.source) { whereClauses.push('l.source = ?'); params.push(filters.source); }
    if (filters.created_by) { whereClauses.push('l.created_by = ?'); params.push(filters.created_by); }
    if (filters.branch_users && filters.branch_users.length) {
      whereClauses.push(`l.assigned_to IN (${filters.branch_users.map(() => '?').join(',')})`);
      params.push(...filters.branch_users);
    }
    if (filters.date_from) { whereClauses.push('l.created_at >= ?'); params.push(filters.date_from); }
    if (filters.date_to) { whereClauses.push('l.created_at <= ?'); params.push(filters.date_to); }
    if (filters.search) {
      whereClauses.push('(l.customer_name LIKE ? OR l.phone LIKE ? OR l.email LIKE ?)');
      const s = `%${filters.search}%`;
      params.push(s, s, s);
    }

    const where = whereClauses.join(' AND ');

    const [countRows] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM leads l WHERE ${where}`, params)
    ]);
    const total = countRows[0].total;

    const data = await query(
      `SELECT l.*, u.name AS assigned_agent_name, pt.name AS product_type_name
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.user_id
       LEFT JOIN product_types pt ON l.product_type_id = pt.product_type_id
       WHERE ${where}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { data, total };
  },

  async create(data) {
    const result = await query(
      `INSERT INTO leads (customer_name, phone, email, product_type_id, source, status, sub_status, assigned_to, created_by, notes, expected_premium)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.customer_name,
        data.phone,
        data.email || null,
        data.product_type_id || null,
        data.source,
        data.status || 'New',
        data.sub_status || null,
        data.assigned_to || null,
        data.created_by || null,
        data.notes || null,
        data.expected_premium || 0.00
      ]
    );
    return Lead.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowed = ['customer_name', 'phone', 'email', 'product_type_id', 'source', 'status', 'sub_status', 'assigned_to', 'notes', 'expected_premium'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (!fields.length) return Lead.findById(id);

    params.push(id);
    await query(`UPDATE leads SET ${fields.join(', ')} WHERE lead_id = ?`, params);
    return Lead.findById(id);
  },

  async softDelete(id) {
    await query('UPDATE leads SET is_deleted = 1 WHERE lead_id = ?', [id]);
    return true;
  }
};

module.exports = Lead;
