const { validationResult } = require('express-validator');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // express-validator validation errors
  if (err.type === 'validation' || (err.array && typeof err.array === 'function')) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.array()
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    const match = err.message.match(/for key '(.+?)'/);
    const key = match ? match[1] : 'field';
    return res.status(409).json({
      success: false,
      message: `Duplicate entry: a record with that ${key} already exists`
    });
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist'
    });
  }

  // MySQL row referenced by FK (cannot delete)
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      success: false,
      message: 'Cannot delete: record is referenced by other data'
    });
  }

  // SyntaxError in body parsing
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
