const { validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { query } = require('../config/db');

const getBranchUserIds = async (branchId) => {
  const rows = await query('SELECT user_id FROM users WHERE branch_id = ? AND is_active = 1', [branchId]);
  return rows.map(r => r.user_id);
};

const getActivities = async (req, res, next) => {
  try {
    const { lead_id, user_id, activity_type, date_from, date_to, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (lead_id) filters.lead_id = parseInt(lead_id);
    if (activity_type) filters.activity_type = activity_type;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const { role_name, user_id: currentUserId, branch_id } = req.user;

    if (role_name === 'Sales Agent') {
      filters.user_id = currentUserId;
    } else if (role_name === 'Branch Manager' || role_name === 'Team Leader') {
      if (user_id) {
        filters.user_id = parseInt(user_id);
      } else {
        const branchUsers = await getBranchUserIds(branch_id);
        filters.branch_users = branchUsers;
      }
    } else {
      if (user_id) filters.user_id = parseInt(user_id);
    }

    const pagination = { page: parseInt(page), limit: Math.min(parseInt(limit), 100) };
    const { data, total } = await Activity.findAll(filters, pagination);

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

const createActivity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const {
      lead_id, activity_type, activity_date, duration_minutes,
      outcome, notes, location_lat, location_long, is_scheduled, reminder_at
    } = req.body;

    const activity = await Activity.create({
      lead_id,
      user_id: req.user.user_id,
      activity_type,
      activity_date,
      duration_minutes,
      outcome,
      notes,
      location_lat,
      location_long,
      is_scheduled: is_scheduled || false,
      reminder_at: is_scheduled ? reminder_at : null
    });

    // Create reminder notification if scheduled
    if (is_scheduled && reminder_at) {
      await Notification.create(
        req.user.user_id,
        `Reminder: ${activity_type} scheduled for ${new Date(activity_date).toLocaleString()}`,
        'reminder'
      );
    }

    res.locals.createdId = activity.activity_id;
    return res.status(201).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

const getUpcomingActivities = async (req, res, next) => {
  try {
    const { role_name, user_id, branch_id } = req.user;

    let userFilter = '';
    const params = [];

    if (role_name === 'Sales Agent') {
      userFilter = 'AND a.user_id = ?';
      params.push(user_id);
    } else if (role_name === 'Branch Manager' || role_name === 'Team Leader') {
      const branchUsers = await getBranchUserIds(branch_id);
      if (branchUsers.length) {
        userFilter = `AND a.user_id IN (${branchUsers.map(() => '?').join(',')})`;
        params.push(...branchUsers);
      }
    }

    const data = await query(
      `SELECT a.*, l.customer_name, u.name AS agent_name
       FROM activities a
       JOIN leads l ON a.lead_id = l.lead_id
       JOIN users u ON a.user_id = u.user_id
       WHERE a.is_scheduled = 1 AND a.reminder_at > NOW()
       ${userFilter}
       ORDER BY a.reminder_at ASC
       LIMIT 50`,
      params
    );

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await Activity.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Only owner or managers can update
    if (req.user.role_name === 'Sales Agent' && existing.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updated = await Activity.update(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await Activity.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    if (req.user.role_name === 'Sales Agent' && existing.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Activity.remove(id);
    return res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivities, createActivity, getUpcomingActivities, updateActivity, deleteActivity };
