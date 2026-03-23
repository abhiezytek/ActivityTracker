const { validationResult } = require('express-validator');
const Policy = require('../models/Policy');

const getPolicies = async (req, res, next) => {
  try {
    const { product_type_id, agent_id, date_from, date_to, search, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (product_type_id) filters.product_type_id = parseInt(product_type_id);
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (search) filters.search = search;

    const { role_name, user_id, branch_id } = req.user;

    if (role_name === 'Sales Agent') {
      filters.agent_id = user_id;
    } else if (agent_id) {
      filters.agent_id = parseInt(agent_id);
    }

    const pagination = { page: parseInt(page), limit: Math.min(parseInt(limit), 100) };
    const { data, total } = await Policy.findAll(filters, pagination);

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

const createPolicy = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { customer_name, policy_number, lead_id, product_type_id, premium, start_date, end_date, agent_id } = req.body;

    const policy = await Policy.create({
      customer_name,
      policy_number,
      lead_id,
      product_type_id,
      premium,
      start_date,
      end_date,
      agent_id
    });

    res.locals.createdId = policy.policy_id;
    return res.status(201).json({ success: true, data: policy });
  } catch (err) {
    next(err);
  }
};

const getRenewals = async (req, res, next) => {
  try {
    const { role_name, user_id } = req.user;
    const agentId = role_name === 'Sales Agent' ? user_id : (req.query.agent_id ? parseInt(req.query.agent_id) : null);

    const renewals = await Policy.findRenewals(agentId);
    return res.status(200).json({ success: true, data: renewals });
  } catch (err) {
    next(err);
  }
};

const updatePolicy = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await Policy.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const updated = await Policy.update(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deletePolicy = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await Policy.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    await Policy.remove(id);
    return res.status(200).json({ success: true, message: 'Policy deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPolicies, createPolicy, getRenewals, updatePolicy, deletePolicy };
