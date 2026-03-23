const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getActivities, createActivity, getUpcomingActivities, updateActivity, deleteActivity
} = require('../controllers/activitiesController');
const { authenticate } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');

/**
 * @swagger
 * /activities:
 *   get:
 *     tags: [Activities]
 *     summary: List activities (role-based)
 *     parameters:
 *       - in: query
 *         name: lead_id
 *         schema: { type: integer }
 *       - in: query
 *         name: user_id
 *         schema: { type: integer }
 *       - in: query
 *         name: activity_type
 *         schema: { type: string, enum: [call, meeting, follow-up] }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of activities
 */
router.get('/', authenticate, getActivities);

/**
 * @swagger
 * /activities:
 *   post:
 *     tags: [Activities]
 *     summary: Log a new activity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lead_id, activity_type, activity_date]
 *             properties:
 *               lead_id: { type: integer }
 *               activity_type: { type: string, enum: [call, meeting, follow-up] }
 *               activity_date: { type: string, format: date-time }
 *               duration_minutes: { type: integer }
 *               outcome: { type: string }
 *               notes: { type: string }
 *               location_lat: { type: number }
 *               location_long: { type: number }
 *               is_scheduled: { type: boolean }
 *               reminder_at: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Activity created
 */
router.post(
  '/',
  authenticate,
  auditMiddleware,
  [
    body('lead_id').isInt({ min: 1 }).withMessage('Valid lead_id is required'),
    body('activity_type').isIn(['call', 'meeting', 'follow-up']).withMessage('Invalid activity type'),
    body('activity_date').notEmpty().withMessage('activity_date is required'),
    body('duration_minutes').optional().isInt({ min: 0 }),
    body('location_lat').optional().isFloat({ min: -90, max: 90 }),
    body('location_long').optional().isFloat({ min: -180, max: 180 }),
    body('is_scheduled').optional().isBoolean(),
    body('reminder_at').optional().isISO8601()
  ],
  createActivity
);

/**
 * @swagger
 * /activities/upcoming:
 *   get:
 *     tags: [Activities]
 *     summary: Get upcoming scheduled activities
 *     responses:
 *       200:
 *         description: List of upcoming activities
 */
router.get('/upcoming', authenticate, getUpcomingActivities);

/**
 * @swagger
 * /activities/{id}:
 *   put:
 *     tags: [Activities]
 *     summary: Update an activity
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Activity updated
 */
router.put(
  '/:id',
  authenticate,
  auditMiddleware,
  [
    body('activity_type').optional().isIn(['call', 'meeting', 'follow-up']),
    body('duration_minutes').optional().isInt({ min: 0 }),
    body('location_lat').optional().isFloat({ min: -90, max: 90 }),
    body('location_long').optional().isFloat({ min: -180, max: 180 }),
    body('is_scheduled').optional().isBoolean(),
    body('reminder_at').optional().isISO8601()
  ],
  updateActivity
);

/**
 * @swagger
 * /activities/{id}:
 *   delete:
 *     tags: [Activities]
 *     summary: Delete an activity
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Activity deleted
 */
router.delete('/:id', authenticate, auditMiddleware, deleteActivity);

module.exports = router;
