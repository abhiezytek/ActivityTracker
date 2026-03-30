const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await query(
      `SELECT u.user_id, u.name, u.email, u.role_id, u.branch_id, u.is_active,
              r.name AS role_name, r.permissions
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [decoded.user_id]
    );

    if (!users.length || !users[0].is_active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    const user = users[0];
    // Parse permissions if stored as string
    if (typeof user.permissions === 'string') {
      try { user.permissions = JSON.parse(user.permissions); } catch { user.permissions = {}; }
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    next(err);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const permissions = req.user.permissions || {};
    const hasPermission = Object.values(permissions).some(
      (actions) => Array.isArray(actions) && actions.includes(permission)
    );
    if (!hasPermission) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize, authorizePermission };
