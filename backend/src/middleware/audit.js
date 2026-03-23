const { query } = require('../config/db');

// Derive entity name from URL path (e.g., /api/leads/5 -> leads)
const getEntityFromPath = (path) => {
  const segments = path.replace(/^\/api\//, '').split('/');
  return segments[0] || 'unknown';
};

// Map HTTP method to audit action
const getAction = (method) => {
  if (method === 'POST') return 'CREATE';
  if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  return null;
};

// Fetch existing record for before-image on UPDATE
const fetchOldValue = async (entity, entityId) => {
  const tableMap = {
    leads: 'leads',
    activities: 'activities',
    users: 'users',
    policies: 'policies',
    opportunities: 'opportunities',
    notifications: 'notifications'
  };

  const table = tableMap[entity];
  if (!table || !entityId) return null;

  const idColumn = `${entity.slice(0, -1)}_id`; // e.g. leads -> lead_id
  const idMap = {
    leads: 'lead_id',
    activities: 'activity_id',
    users: 'user_id',
    policies: 'policy_id',
    opportunities: 'opportunity_id',
    notifications: 'notification_id'
  };

  try {
    const col = idMap[entity] || idColumn;
    const rows = await query(`SELECT * FROM \`${table}\` WHERE \`${col}\` = ?`, [entityId]);
    return rows.length ? rows[0] : null;
  } catch {
    return null;
  }
};

const auditMiddleware = (req, res, next) => {
  const action = getAction(req.method);
  if (!action) return next();

  const entity = getEntityFromPath(req.path || req.url);
  const entityId = req.params.id || null;
  const userId = req.user ? req.user.user_id : null;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // For UPDATE, capture old value before the handler runs
  if (action === 'UPDATE' && entityId) {
    fetchOldValue(entity, entityId).then((oldValue) => {
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            await query(
              `INSERT INTO audit_logs (user_id, action, entity, entity_id, old_value, new_value, ip_address)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                userId,
                action,
                entity,
                entityId,
                oldValue ? JSON.stringify(oldValue) : null,
                req.body ? JSON.stringify(req.body) : null,
                ip
              ]
            );
          } catch (err) {
            console.error('Audit log error:', err.message);
          }
        }
      });
      next();
    }).catch(() => next());
  } else {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const resolvedEntityId = entityId || (res.locals.createdId ? String(res.locals.createdId) : null);
        try {
          await query(
            `INSERT INTO audit_logs (user_id, action, entity, entity_id, old_value, new_value, ip_address)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              action,
              entity,
              resolvedEntityId,
              null,
              req.body ? JSON.stringify(req.body) : null,
              ip
            ]
          );
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
    });
    next();
  }
};

module.exports = auditMiddleware;
