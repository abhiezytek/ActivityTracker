const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const { role_id, branch_id, search, is_active, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (role_id) filters.role_id = parseInt(role_id);
    if (branch_id) filters.branch_id = parseInt(branch_id);
    if (search) filters.search = search;
    if (is_active !== undefined) filters.is_active = parseInt(is_active);

    const pagination = { page: parseInt(page), limit: Math.min(parseInt(limit), 100) };
    const { data, total } = await User.findAll(filters, pagination);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password, role_id, branch_id, is_active } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role_id, branch_id, is_active });

    res.locals.createdId = user.user_id;
    const { password: _pw, ...safeUser } = user;
    return res.status(201).json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password: _pw, ...safeUser } = user;
    return res.status(200).json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await User.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, role_id, branch_id, is_active } = req.body;
    const updated = await User.update(id, { name, email, role_id, branch_id, is_active });

    const { password: _pw, ...safeUser } = updated;
    return res.status(200).json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await User.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (id === req.user.user_id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await User.update(id, { is_active: 0 });
    return res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser, getUserById, updateUser, deleteUser };
