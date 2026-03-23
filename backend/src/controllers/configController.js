const { validationResult } = require('express-validator');
const { query } = require('../config/db');

// ── Roles ────────────────────────────────────────────────────────────────────

const getRoles = async (req, res, next) => {
  try {
    const roles = await query('SELECT * FROM roles ORDER BY role_id ASC');
    for (const r of roles) {
      if (typeof r.permissions === 'string') {
        try { r.permissions = JSON.parse(r.permissions); } catch { r.permissions = {}; }
      }
    }
    return res.status(200).json({ success: true, data: roles });
  } catch (err) {
    next(err);
  }
};

const createRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, permissions } = req.body;
    const result = await query(
      'INSERT INTO roles (name, permissions) VALUES (?, ?)',
      [name, JSON.stringify(permissions || {})]
    );

    const rows = await query('SELECT * FROM roles WHERE role_id = ?', [result.insertId]);
    const role = rows[0];
    if (typeof role.permissions === 'string') {
      try { role.permissions = JSON.parse(role.permissions); } catch { role.permissions = {}; }
    }
    res.locals.createdId = role.role_id;
    return res.status(201).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await query('SELECT * FROM roles WHERE role_id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const { name, permissions } = req.body;
    const fields = [];
    const params = [];
    if (name) { fields.push('name = ?'); params.push(name); }
    if (permissions !== undefined) { fields.push('permissions = ?'); params.push(JSON.stringify(permissions)); }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(id);
    await query(`UPDATE roles SET ${fields.join(', ')} WHERE role_id = ?`, params);

    const rows = await query('SELECT * FROM roles WHERE role_id = ?', [id]);
    const role = rows[0];
    if (typeof role.permissions === 'string') {
      try { role.permissions = JSON.parse(role.permissions); } catch { role.permissions = {}; }
    }
    return res.status(200).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const users = await query('SELECT COUNT(*) AS cnt FROM users WHERE role_id = ?', [id]);
    if (users[0].cnt > 0) {
      return res.status(409).json({ success: false, message: 'Cannot delete role: users are assigned to it' });
    }

    await query('DELETE FROM roles WHERE role_id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Role deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Product Types ─────────────────────────────────────────────────────────────

const getProductTypes = async (req, res, next) => {
  try {
    const data = await query('SELECT * FROM product_types ORDER BY product_type_id ASC');
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const createProductType = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, description } = req.body;
    const result = await query(
      'INSERT INTO product_types (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    const rows = await query('SELECT * FROM product_types WHERE product_type_id = ?', [result.insertId]);
    res.locals.createdId = result.insertId;
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateProductType = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await query('SELECT * FROM product_types WHERE product_type_id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Product type not found' });
    }

    const { name, description, is_active } = req.body;
    const fields = [];
    const params = [];
    if (name) { fields.push('name = ?'); params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(id);
    await query(`UPDATE product_types SET ${fields.join(', ')} WHERE product_type_id = ?`, params);
    const rows = await query('SELECT * FROM product_types WHERE product_type_id = ?', [id]);
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteProductType = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await query('UPDATE product_types SET is_active = 0 WHERE product_type_id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Product type deactivated' });
  } catch (err) {
    next(err);
  }
};

// ── Lead Sub-Statuses ─────────────────────────────────────────────────────────

const getLeadSubStatuses = async (req, res, next) => {
  try {
    const { lead_status } = req.query;
    const params = [];
    let where = '';
    if (lead_status) {
      where = 'WHERE lead_status = ?';
      params.push(lead_status);
    }

    const data = await query(`SELECT * FROM lead_sub_statuses ${where} ORDER BY id ASC`, params);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const createLeadSubStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { lead_status, sub_status_name } = req.body;
    const result = await query(
      'INSERT INTO lead_sub_statuses (lead_status, sub_status_name) VALUES (?, ?)',
      [lead_status, sub_status_name]
    );

    const rows = await query('SELECT * FROM lead_sub_statuses WHERE id = ?', [result.insertId]);
    res.locals.createdId = result.insertId;
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateLeadSubStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await query('SELECT * FROM lead_sub_statuses WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Lead sub-status not found' });
    }

    const { lead_status, sub_status_name, is_active } = req.body;
    const fields = [];
    const params = [];
    if (lead_status) { fields.push('lead_status = ?'); params.push(lead_status); }
    if (sub_status_name) { fields.push('sub_status_name = ?'); params.push(sub_status_name); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(id);
    await query(`UPDATE lead_sub_statuses SET ${fields.join(', ')} WHERE id = ?`, params);
    const rows = await query('SELECT * FROM lead_sub_statuses WHERE id = ?', [id]);
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteLeadSubStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await query('UPDATE lead_sub_statuses SET is_active = 0 WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Lead sub-status deactivated' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRoles, createRole, updateRole, deleteRole,
  getProductTypes, createProductType, updateProductType, deleteProductType,
  getLeadSubStatuses, createLeadSubStatus, updateLeadSubStatus, deleteLeadSubStatus
};
