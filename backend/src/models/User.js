const { query } = require('../config/db');

const User = {
  async findById(id) {
    const rows = await query(
      `SELECT u.user_id, u.name, u.email, u.role_id, u.branch_id, u.is_active, u.created_at,
              r.name AS role_name, r.permissions,
              b.name AS branch_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN branches b ON u.branch_id = b.branch_id
       WHERE u.user_id = ?`,
      [id]
    );
    if (!rows.length) return null;
    const user = rows[0];
    if (typeof user.permissions === 'string') {
      try { user.permissions = JSON.parse(user.permissions); } catch { user.permissions = {}; }
    }
    return user;
  },

  async findByEmail(email) {
    const rows = await query(
      `SELECT u.*, r.name AS role_name, r.permissions, b.name AS branch_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN branches b ON u.branch_id = b.branch_id
       WHERE u.email = ?`,
      [email]
    );
    if (!rows.length) return null;
    const user = rows[0];
    if (typeof user.permissions === 'string') {
      try { user.permissions = JSON.parse(user.permissions); } catch { user.permissions = {}; }
    }
    return user;
  },

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    const params = [];

    if (filters.role_id) { whereClauses.push('u.role_id = ?'); params.push(filters.role_id); }
    if (filters.branch_id) { whereClauses.push('u.branch_id = ?'); params.push(filters.branch_id); }
    if (filters.is_active !== undefined) { whereClauses.push('u.is_active = ?'); params.push(filters.is_active); }
    if (filters.search) {
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ?)');
      const s = `%${filters.search}%`;
      params.push(s, s);
    }

    const where = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM users u ${where}`,
      params
    );
    const total = countRows[0].total;

    const data = await query(
      `SELECT u.user_id, u.name, u.email, u.role_id, u.branch_id, u.is_active, u.created_at,
              r.name AS role_name, b.name AS branch_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN branches b ON u.branch_id = b.branch_id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { data, total };
  },

  async create(data) {
    const result = await query(
      `INSERT INTO users (name, email, password, role_id, branch_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.email,
        data.password,
        data.role_id,
        data.branch_id || null,
        data.is_active !== undefined ? data.is_active : 1
      ]
    );
    return User.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowed = ['name', 'email', 'role_id', 'branch_id', 'is_active', 'password'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (!fields.length) return User.findById(id);

    params.push(id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, params);
    return User.findById(id);
  }
};

module.exports = User;
