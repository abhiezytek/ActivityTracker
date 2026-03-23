const { query } = require('../config/db');

const Opportunity = {
  async findById(id) {
    const rows = await query(
      `SELECT o.*, l.customer_name, l.assigned_to AS agent_id, u.name AS agent_name
       FROM opportunities o
       JOIN leads l ON o.lead_id = l.lead_id
       LEFT JOIN users u ON l.assigned_to = u.user_id
       WHERE o.opportunity_id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    const params = [];

    if (filters.lead_id) { whereClauses.push('o.lead_id = ?'); params.push(filters.lead_id); }
    if (filters.stage) { whereClauses.push('o.stage = ?'); params.push(filters.stage); }
    if (filters.agent_id) { whereClauses.push('l.assigned_to = ?'); params.push(filters.agent_id); }

    const where = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countRows = await query(
      `SELECT COUNT(*) AS total
       FROM opportunities o
       JOIN leads l ON o.lead_id = l.lead_id
       ${where}`,
      params
    );
    const total = countRows[0].total;

    const data = await query(
      `SELECT o.*, l.customer_name, l.assigned_to AS agent_id, u.name AS agent_name
       FROM opportunities o
       JOIN leads l ON o.lead_id = l.lead_id
       LEFT JOIN users u ON l.assigned_to = u.user_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { data, total };
  },

  async create(data) {
    const result = await query(
      `INSERT INTO opportunities (lead_id, stage, premium_amount, probability, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.lead_id,
        data.stage,
        data.premium_amount,
        data.probability,
        data.notes || null
      ]
    );
    return Opportunity.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowed = ['stage', 'premium_amount', 'probability', 'notes'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (!fields.length) return Opportunity.findById(id);

    params.push(id);
    await query(`UPDATE opportunities SET ${fields.join(', ')} WHERE opportunity_id = ?`, params);
    return Opportunity.findById(id);
  },

  async remove(id) {
    await query('DELETE FROM opportunities WHERE opportunity_id = ?', [id]);
    return true;
  },

  async getPipeline(filters = {}) {
    let whereClauses = [];
    const params = [];

    if (filters.agent_id) { whereClauses.push('l.assigned_to = ?'); params.push(filters.agent_id); }

    const where = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const rows = await query(
      `SELECT o.stage,
              COUNT(*) AS count,
              SUM(o.premium_amount) AS total_premium,
              AVG(o.probability) AS avg_probability
       FROM opportunities o
       JOIN leads l ON o.lead_id = l.lead_id
       ${where}
       GROUP BY o.stage
       ORDER BY o.stage`,
      params
    );
    return rows;
  }
};

module.exports = Opportunity;
