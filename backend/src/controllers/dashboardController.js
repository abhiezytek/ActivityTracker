const { query } = require('../config/db');

const getBranchUserIds = async (branchId) => {
  const rows = await query('SELECT user_id FROM users WHERE branch_id = ? AND is_active = 1', [branchId]);
  return rows.map(r => r.user_id);
};

const buildScopeFilter = async (user, tableAlias = '') => {
  const col = (name) => tableAlias ? `${tableAlias}.${name}` : name;
  const { role_name, user_id, branch_id } = user;

  if (role_name === 'Sales Agent') {
    return { where: `AND ${col('assigned_to')} = ?`, params: [user_id] };
  }
  if (role_name === 'Branch Manager' || role_name === 'Team Leader') {
    const branchUsers = await getBranchUserIds(branch_id);
    if (branchUsers.length) {
      return {
        where: `AND ${col('assigned_to')} IN (${branchUsers.map(() => '?').join(',')})`,
        params: branchUsers
      };
    }
    return { where: `AND 1=0`, params: [] };
  }
  return { where: '', params: [] };
};

const getKpis = async (req, res, next) => {
  try {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const date_from = req.query.date_from || defaultFrom;
    const date_to = req.query.date_to || defaultTo;

    const { where: scopeWhere, params: scopeParams } = await buildScopeFilter(req.user, 'l');

    // Total leads in scope
    const [totalLeadsRow] = await query(
      `SELECT COUNT(*) AS cnt FROM leads l WHERE l.is_deleted = 0 ${scopeWhere}`,
      scopeParams
    );

    // New leads in period
    const [newLeadsRow] = await query(
      `SELECT COUNT(*) AS cnt FROM leads l
       WHERE l.is_deleted = 0 AND l.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY) ${scopeWhere}`,
      [date_from, date_to, ...scopeParams]
    );

    // Closed leads for conversion ratio
    const [closedLeadsRow] = await query(
      `SELECT COUNT(*) AS cnt FROM leads l
       WHERE l.is_deleted = 0 AND l.status = 'Closed' ${scopeWhere}`,
      scopeParams
    );

    // Activity scope is by user, not lead assigned_to
    const { role_name, user_id, branch_id } = req.user;
    let activityWhere = '';
    let activityParams = [date_from, date_to];

    if (role_name === 'Sales Agent') {
      activityWhere = 'AND a.user_id = ?';
      activityParams.push(user_id);
    } else if (role_name === 'Branch Manager' || role_name === 'Team Leader') {
      const branchUsers = await getBranchUserIds(branch_id);
      if (branchUsers.length) {
        activityWhere = `AND a.user_id IN (${branchUsers.map(() => '?').join(',')})`;
        activityParams.push(...branchUsers);
      }
    }

    const [callsRow] = await query(
      `SELECT COUNT(*) AS cnt FROM activities a
       WHERE a.activity_type = 'call' AND DATE(a.activity_date) BETWEEN ? AND ?
       ${activityWhere}`,
      activityParams
    );

    const [meetingsRow] = await query(
      `SELECT COUNT(*) AS cnt FROM activities a
       WHERE a.activity_type = 'meeting' AND DATE(a.activity_date) BETWEEN ? AND ?
       ${activityWhere}`,
      activityParams
    );

    // Premium generated from policies
    const policyParams = [date_from, date_to];
    let policyWhere = '';
    if (role_name === 'Sales Agent') {
      policyWhere = 'AND p.agent_id = ?';
      policyParams.push(user_id);
    } else if (role_name === 'Branch Manager' || role_name === 'Team Leader') {
      const branchUsers = await getBranchUserIds(branch_id);
      if (branchUsers.length) {
        policyWhere = `AND p.agent_id IN (${branchUsers.map(() => '?').join(',')})`;
        policyParams.push(...branchUsers);
      }
    }

    const [premiumRow] = await query(
      `SELECT COALESCE(SUM(p.premium), 0) AS total
       FROM policies p
       WHERE p.start_date BETWEEN ? AND ? ${policyWhere}`,
      policyParams
    );

    // Activities today
    const todayParams = [];
    let todayWhere = '';
    if (role_name === 'Sales Agent') {
      todayWhere = 'AND a.user_id = ?';
      todayParams.push(user_id);
    } else if (role_name === 'Branch Manager' || role_name === 'Team Leader') {
      const branchUsers = await getBranchUserIds(branch_id);
      if (branchUsers.length) {
        todayWhere = `AND a.user_id IN (${branchUsers.map(() => '?').join(',')})`;
        todayParams.push(...branchUsers);
      }
    }

    const [activitiesTodayRow] = await query(
      `SELECT COUNT(*) AS cnt FROM activities a WHERE DATE(a.activity_date) = CURDATE() ${todayWhere}`,
      todayParams
    );

    const total_leads = totalLeadsRow.cnt;
    const closed_leads = closedLeadsRow.cnt;
    const conversion_ratio = total_leads > 0 ? ((closed_leads / total_leads) * 100).toFixed(2) : '0.00';

    return res.status(200).json({
      success: true,
      data: {
        total_leads,
        new_leads: newLeadsRow.cnt,
        calls: callsRow.cnt,
        meetings: meetingsRow.cnt,
        conversion_ratio: parseFloat(conversion_ratio),
        premium_generated: parseFloat(premiumRow.total),
        activities_today: activitiesTodayRow.cnt
      }
    });
  } catch (err) {
    next(err);
  }
};

const getPipeline = async (req, res, next) => {
  try {
    const { where: scopeWhere, params: scopeParams } = await buildScopeFilter(req.user, 'l');

    const data = await query(
      `SELECT l.status, COUNT(*) AS count
       FROM leads l
       WHERE l.is_deleted = 0 ${scopeWhere}
       GROUP BY l.status
       ORDER BY FIELD(l.status, 'New', 'Contacted', 'Qualified', 'Proposal', 'Closed')`,
      scopeParams
    );

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getPerformance = async (req, res, next) => {
  try {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const date_from = req.query.date_from || defaultFrom;
    const date_to = req.query.date_to || defaultTo;
    const { agent_id, branch_id: qBranchId } = req.query;

    let userFilter = '';
    const params = [date_from, date_to, date_from, date_to, date_from, date_to];

    if (agent_id) {
      userFilter = 'WHERE u.user_id = ?';
      params.push(parseInt(agent_id));
    } else if (qBranchId) {
      userFilter = 'WHERE u.branch_id = ?';
      params.push(parseInt(qBranchId));
    } else if (req.user.role_name === 'Branch Manager' || req.user.role_name === 'Team Leader') {
      userFilter = 'WHERE u.branch_id = ?';
      params.push(req.user.branch_id);
    }

    const data = await query(
      `SELECT
         u.user_id, u.name AS agent_name,
         COUNT(DISTINCT l.lead_id) AS total_leads,
         COUNT(DISTINCT a.activity_id) AS activities_count,
         SUM(CASE WHEN a.activity_type = 'call' THEN 1 ELSE 0 END) AS calls,
         SUM(CASE WHEN a.activity_type = 'meeting' THEN 1 ELSE 0 END) AS meetings,
         SUM(CASE WHEN a.activity_type = 'follow-up' THEN 1 ELSE 0 END) AS follow_ups,
         COUNT(DISTINCT CASE WHEN l.status = 'Closed' THEN l.lead_id END) AS closed_deals,
         COALESCE(SUM(DISTINCT p.premium), 0) AS premium_generated
       FROM users u
       LEFT JOIN leads l ON l.assigned_to = u.user_id AND l.is_deleted = 0
         AND l.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
       LEFT JOIN activities a ON a.user_id = u.user_id
         AND DATE(a.activity_date) BETWEEN ? AND ?
       LEFT JOIN policies p ON p.agent_id = u.user_id
         AND p.start_date BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
       ${userFilter}
       GROUP BY u.user_id, u.name
       ORDER BY total_leads DESC`,
      params
    );

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getActivitiesSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const date_from = req.query.date_from || defaultFrom;
    const date_to = req.query.date_to || defaultTo;

    const { role_name, user_id, branch_id } = req.user;
    let userFilter = '';
    const params = [date_from, date_to];

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

    const [summaryRow] = await query(
      `SELECT
         SUM(CASE WHEN a.activity_type = 'call' THEN 1 ELSE 0 END) AS calls,
         SUM(CASE WHEN a.activity_type = 'meeting' THEN 1 ELSE 0 END) AS meetings,
         SUM(CASE WHEN a.activity_type = 'follow-up' THEN 1 ELSE 0 END) AS follow_ups
       FROM activities a
       WHERE DATE(a.activity_date) BETWEEN ? AND ?
       ${userFilter}`,
      params
    );

    const byDay = await query(
      `SELECT DATE(a.activity_date) AS date, a.activity_type, COUNT(*) AS count
       FROM activities a
       WHERE DATE(a.activity_date) BETWEEN ? AND ?
       ${userFilter}
       GROUP BY DATE(a.activity_date), a.activity_type
       ORDER BY date ASC`,
      params
    );

    return res.status(200).json({
      success: true,
      data: {
        calls: summaryRow.calls || 0,
        meetings: summaryRow.meetings || 0,
        follow_ups: summaryRow.follow_ups || 0,
        by_day: byDay
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getKpis, getPipeline, getPerformance, getActivitiesSummary };
