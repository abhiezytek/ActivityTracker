const { validationResult } = require('express-validator');
const ExcelJS = require('exceljs');
const Lead = require('../models/Lead');
const Notification = require('../models/Notification');
const { query } = require('../config/db');

// Resolve branch user IDs for Branch Manager / Team Leader scope
const getBranchUserIds = async (branchId) => {
  const rows = await query('SELECT user_id FROM users WHERE branch_id = ? AND is_active = 1', [branchId]);
  return rows.map(r => r.user_id);
};

const getLeads = async (req, res, next) => {
  try {
    const {
      status, product_type_id, assigned_to, source,
      date_from, date_to, search,
      page = 1, limit = 20
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (product_type_id) filters.product_type_id = parseInt(product_type_id);
    if (source) filters.source = source;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (search) filters.search = search;

    const { role_name, user_id, branch_id } = req.user;

    if (role_name === 'Sales Agent') {
      filters.assigned_to = user_id;
    } else if (role_name === 'Branch Manager' || role_name === 'Team Leader') {
      if (assigned_to) {
        filters.assigned_to = parseInt(assigned_to);
      } else {
        const branchUsers = await getBranchUserIds(branch_id);
        filters.branch_users = branchUsers;
      }
    } else {
      // Admin, Compliance Officer - see all
      if (assigned_to) filters.assigned_to = parseInt(assigned_to);
    }

    const pagination = { page: parseInt(page), limit: Math.min(parseInt(limit), 100) };
    const { data, total } = await Lead.findAll(filters, pagination);

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

const createLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { customer_name, phone, email, product_type_id, source, status, assigned_to, notes, expected_premium } = req.body;

    const lead = await Lead.create({
      customer_name,
      phone,
      email,
      product_type_id,
      source,
      status: status || 'new',
      assigned_to: assigned_to || req.user.user_id,
      created_by: req.user.user_id,
      notes: notes || null,
      expected_premium: expected_premium || 0.00
    });

    res.locals.createdId = lead.lead_id;
    return res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

const getLeadById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const lead = await Lead.findWithActivities(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const { role_name, user_id, branch_id } = req.user;

    if (role_name === 'Sales Agent' && lead.assigned_to !== user_id && lead.created_by !== user_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if ((role_name === 'Branch Manager' || role_name === 'Team Leader') && lead.assigned_to) {
      const branchUsers = await getBranchUserIds(branch_id);
      if (!branchUsers.includes(lead.assigned_to)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    return res.status(200).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await Lead.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const updated = await Lead.update(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await Lead.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    await Lead.softDelete(id);
    return res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const uploadLeads = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    const rows = [];
    let headers = null;
    worksheet.eachRow((row, rowNumber) => {
      const values = row.values.slice(1); // row.values[0] is always undefined in exceljs
      if (rowNumber === 1) {
        headers = values.map(v => String(v || '').toLowerCase().trim());
        return;
      }
      if (!headers) return;
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i] !== undefined && values[i] !== null ? values[i] : ''; });
      rows.push(obj);
    });

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    // Fetch product types for name->id mapping
    const productTypes = await query('SELECT product_type_id, name FROM product_types WHERE is_active = 1');
    const ptMap = {};
    for (const pt of productTypes) {
      ptMap[pt.name.toLowerCase()] = pt.product_type_id;
    }

    const validSources = ['online', 'referral', 'walk-in'];
    let inserted = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-indexed header)

      const customer_name = String(row.customer_name || '').trim();
      const phone = String(row.phone || '').trim();
      const email = String(row.email || '').trim() || null;
      const source = String(row.source || 'online').trim().toLowerCase();
      let product_type_id = null;

      if (!customer_name || !phone) {
        errors.push({ row: rowNum, error: 'customer_name and phone are required' });
        skipped++;
        continue;
      }

      if (!validSources.includes(source)) {
        errors.push({ row: rowNum, error: `Invalid source: ${source}` });
        skipped++;
        continue;
      }

      // Resolve product_type
      if (row.product_type) {
        const ptKey = String(row.product_type).trim().toLowerCase();
        if (!isNaN(ptKey)) {
          product_type_id = parseInt(ptKey);
        } else {
          product_type_id = ptMap[ptKey] || null;
        }
      } else if (row.product_type_id) {
        product_type_id = parseInt(row.product_type_id);
      }

      try {
        await Lead.create({
          customer_name,
          phone,
          email,
          product_type_id,
          source,
          status: 'New',
          assigned_to: req.user.user_id,
          created_by: req.user.user_id
        });
        inserted++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          skipped++;
        } else {
          errors.push({ row: rowNum, error: err.message });
          skipped++;
        }
      }
    }

    return res.status(200).json({ success: true, data: { inserted, skipped, errors } });
  } catch (err) {
    next(err);
  }
};

const assignLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const { assigned_to } = req.body;

    const existing = await Lead.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const assignedUser = await query('SELECT user_id, name FROM users WHERE user_id = ? AND is_active = 1', [assigned_to]);
    if (!assignedUser.length) {
      return res.status(400).json({ success: false, message: 'Assigned user not found or inactive' });
    }

    const updated = await Lead.update(id, { assigned_to });

    // Notify the assigned agent
    await Notification.create(
      assigned_to,
      `Lead "${existing.customer_name}" has been assigned to you by ${req.user.name}.`,
      'general'
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeads, createLead, getLeadById, updateLead, deleteLead, uploadLeads, assignLead };
