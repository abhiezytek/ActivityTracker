const { validationResult } = require('express-validator');
const Opportunity = require('../models/Opportunity');

const getOpportunities = async (req, res, next) => {
  try {
    const { lead_id, stage, agent_id, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (lead_id) filters.lead_id = parseInt(lead_id);
    if (stage) filters.stage = stage;

    const { role_name, user_id } = req.user;
    if (role_name === 'Sales Agent') {
      filters.agent_id = user_id;
    } else if (agent_id) {
      filters.agent_id = parseInt(agent_id);
    }

    const pagination = { page: parseInt(page), limit: Math.min(parseInt(limit), 100) };
    const { data, total } = await Opportunity.findAll(filters, pagination);

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

const createOpportunity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { lead_id, stage, premium_amount, probability, notes } = req.body;

    const opportunity = await Opportunity.create({ lead_id, stage, premium_amount, probability, notes });

    res.locals.createdId = opportunity.opportunity_id;
    return res.status(201).json({ success: true, data: opportunity });
  } catch (err) {
    next(err);
  }
};

const getPipeline = async (req, res, next) => {
  try {
    const { role_name, user_id } = req.user;
    const filters = {};
    if (role_name === 'Sales Agent') {
      filters.agent_id = user_id;
    } else if (req.query.agent_id) {
      filters.agent_id = parseInt(req.query.agent_id);
    }

    const data = await Opportunity.getPipeline(filters);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const updateOpportunity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await Opportunity.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    const updated = await Opportunity.update(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteOpportunity = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await Opportunity.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    await Opportunity.remove(id);
    return res.status(200).json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOpportunities, createOpportunity, getPipeline, updateOpportunity, deleteOpportunity };
