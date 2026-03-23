const Notification = require('../models/Notification');
const { query } = require('../config/db');

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pagination = { page: parseInt(page), limit: Math.min(parseInt(limit), 100) };

    const { data, total, unread_count } = await Notification.findByUser(req.user.user_id, pagination);

    return res.status(200).json({
      success: true,
      data,
      unread_count,
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

const markRead = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const rows = await query(
      'SELECT * FROM notifications WHERE notification_id = ? AND user_id = ?',
      [id, req.user.user_id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await Notification.markRead(id, req.user.user_id);
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const count = await Notification.markAllRead(req.user.user_id);
    return res.status(200).json({ success: true, message: `${count} notifications marked as read` });
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const rows = await query(
      'SELECT * FROM notifications WHERE notification_id = ? AND user_id = ?',
      [id, req.user.user_id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await Notification.remove(id, req.user.user_id);
    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

const generateRenewalNotifications = async (userId, isAdmin = false) => {
  try {
    const params = [];
    let agentFilter = '';

    if (!isAdmin) {
      agentFilter = 'AND p.agent_id = ?';
      params.push(userId);
    }

    const policies = await query(
      `SELECT p.policy_id, p.customer_name, p.policy_number, p.end_date, p.agent_id,
              p.renewal_notified_30, p.renewal_notified_60, p.renewal_notified_90,
              DATEDIFF(p.end_date, CURDATE()) AS days_to_expiry
       FROM policies p
       WHERE p.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
       ${agentFilter}`,
      params
    );

    for (const policy of policies) {
      const { days_to_expiry, policy_id, customer_name, policy_number, agent_id } = policy;

      if (days_to_expiry <= 30 && !policy.renewal_notified_30) {
        await Notification.create(
          agent_id,
          `Policy ${policy_number} for ${customer_name} expires in ${days_to_expiry} day(s). Please initiate renewal.`,
          'renewal'
        );
        await query('UPDATE policies SET renewal_notified_30 = 1 WHERE policy_id = ?', [policy_id]);
      } else if (days_to_expiry <= 60 && !policy.renewal_notified_60) {
        await Notification.create(
          agent_id,
          `Policy ${policy_number} for ${customer_name} expires in ${days_to_expiry} day(s). Please plan renewal.`,
          'renewal'
        );
        await query('UPDATE policies SET renewal_notified_60 = 1 WHERE policy_id = ?', [policy_id]);
      } else if (days_to_expiry <= 90 && !policy.renewal_notified_90) {
        await Notification.create(
          agent_id,
          `Policy ${policy_number} for ${customer_name} expires in ${days_to_expiry} day(s). Renewal due soon.`,
          'renewal'
        );
        await query('UPDATE policies SET renewal_notified_90 = 1 WHERE policy_id = ?', [policy_id]);
      }
    }
  } catch (err) {
    console.error('generateRenewalNotifications error:', err.message);
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification, generateRenewalNotifications };
