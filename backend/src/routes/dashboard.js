const express = require('express');
const router = express.Router();
const { getKpis, getPipeline, getPerformance, getActivitiesSummary } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /dashboard/kpis:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get KPI metrics
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: KPI data
 */
router.get('/kpis', authenticate, getKpis);

/**
 * @swagger
 * /dashboard/pipeline:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get lead counts by status (pipeline view)
 *     responses:
 *       200:
 *         description: Pipeline data
 */
router.get('/pipeline', authenticate, getPipeline);

/**
 * @swagger
 * /dashboard/performance:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get per-agent performance report
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: agent_id
 *         schema: { type: integer }
 *       - in: query
 *         name: branch_id
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Performance data per agent
 */
router.get(
  '/performance',
  authenticate,
  authorize('Admin', 'Branch Manager', 'Team Leader'),
  getPerformance
);

/**
 * @swagger
 * /dashboard/activities-summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get activities summary grouped by type and day
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Activities summary
 */
router.get('/activities-summary', authenticate, getActivitiesSummary);

module.exports = router;
