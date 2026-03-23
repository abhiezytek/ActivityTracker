const { query } = require('../config/db');

const Policy = {
  async findById(id) {
    const rows = await query(
      `SELECT p.*, pt.name AS product_type_name, u.name AS agent_name
       FROM policies p
       JOIN product_types pt ON p.product_type_id = pt.product_type_id
       JOIN users u ON p.agent_id = u.user_id
       WHERE p.policy_id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    const params = [];

    if (filters.product_type_id) { whereClauses.push('p.product_type_id = ?'); params.push(filters.product_type_id); }
    if (filters.agent_id) { whereClauses.push('p.agent_id = ?'); params.push(filters.agent_id); }
    if (filters.date_from) { whereClauses.push('p.start_date >= ?'); params.push(filters.date_from); }
    if (filters.date_to) { whereClauses.push('p.start_date <= ?'); params.push(filters.date_to); }
    if (filters.search) {
      whereClauses.push('(p.customer_name LIKE ? OR p.policy_number LIKE ?)');
      const s = `%${filters.search}%`;
      params.push(s, s);
    }

    const where = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM policies p ${where}`,
      params
    );
    const total = countRows[0].total;

    const data = await query(
      `SELECT p.*, pt.name AS product_type_name, u.name AS agent_name
       FROM policies p
       JOIN product_types pt ON p.product_type_id = pt.product_type_id
       JOIN users u ON p.agent_id = u.user_id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { data, total };
  },

  async create(data) {
    const result = await query(
      `INSERT INTO policies (customer_name, policy_number, lead_id, product_type_id, premium, start_date, end_date, agent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.customer_name,
        data.policy_number,
        data.lead_id || null,
        data.product_type_id,
        data.premium,
        data.start_date,
        data.end_date,
        data.agent_id
      ]
    );
    return Policy.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowed = ['customer_name', 'policy_number', 'lead_id', 'product_type_id', 'premium', 'start_date', 'end_date', 'agent_id', 'renewal_notified_30', 'renewal_notified_60', 'renewal_notified_90'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (!fields.length) return Policy.findById(id);

    params.push(id);
    await query(`UPDATE policies SET ${fields.join(', ')} WHERE policy_id = ?`, params);
    return Policy.findById(id);
  },

  async remove(id) {
    await query('DELETE FROM policies WHERE policy_id = ?', [id]);
    return true;
  },

  async findRenewals(agentId = null) {
    const params = [];
    let agentFilter = '';
    if (agentId) {
      agentFilter = 'AND p.agent_id = ?';
      params.push(agentId);
    }

    const rows = await query(
      `SELECT p.*, pt.name AS product_type_name, u.name AS agent_name,
              DATEDIFF(p.end_date, CURDATE()) AS days_to_expiry
       FROM policies p
       JOIN product_types pt ON p.product_type_id = pt.product_type_id
       JOIN users u ON p.agent_id = u.user_id
       WHERE p.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
       ${agentFilter}
       ORDER BY p.end_date ASC`,
      params
    );

    const due_in_30 = rows.filter(r => r.days_to_expiry <= 30);
    const due_in_60 = rows.filter(r => r.days_to_expiry > 30 && r.days_to_expiry <= 60);
    const due_in_90 = rows.filter(r => r.days_to_expiry > 60 && r.days_to_expiry <= 90);

    return { due_in_30, due_in_60, due_in_90 };
  }
};

module.exports = Policy;
