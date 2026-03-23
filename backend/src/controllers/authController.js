const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { query } = require('../config/db');

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
        await query(
          "INSERT INTO notifications (user_id, message, type, status) VALUES (?, ?, 'renewal', 'unread')",
          [agent_id, `Policy ${policy_number} for ${customer_name} expires in ${days_to_expiry} day(s). Please initiate renewal.`]
        );
        await query('UPDATE policies SET renewal_notified_30 = 1 WHERE policy_id = ?', [policy_id]);
      } else if (days_to_expiry <= 60 && !policy.renewal_notified_60) {
        await query(
          "INSERT INTO notifications (user_id, message, type, status) VALUES (?, ?, 'renewal', 'unread')",
          [agent_id, `Policy ${policy_number} for ${customer_name} expires in ${days_to_expiry} day(s). Please plan renewal.`]
        );
        await query('UPDATE policies SET renewal_notified_60 = 1 WHERE policy_id = ?', [policy_id]);
      } else if (days_to_expiry <= 90 && !policy.renewal_notified_90) {
        await query(
          "INSERT INTO notifications (user_id, message, type, status) VALUES (?, ?, 'renewal', 'unread')",
          [agent_id, `Policy ${policy_number} for ${customer_name} expires in ${days_to_expiry} day(s). Renewal due soon.`]
        );
        await query('UPDATE policies SET renewal_notified_90 = 1 WHERE policy_id = ?', [policy_id]);
      }
    }
  } catch (err) {
    console.error('generateRenewalNotifications error:', err.message);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const payload = {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      branch_id: user.branch_id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    // Generate renewal notifications in background
    const isAdmin = user.role_name === 'Admin';
    generateRenewalNotifications(user.user_id, isAdmin).catch(() => {});

    return res.status(200).json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role_name: user.role_name,
        role_id: user.role_id,
        branch_id: user.branch_id,
        branch_name: user.branch_name
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password: _pw, ...safeUser } = user;
    return res.status(200).json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const rows = await query('SELECT password FROM users WHERE user_id = ?', [req.user.user_id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, req.user.user_id]);

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, logout, changePassword, generateRenewalNotifications };
