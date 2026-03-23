const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getOpportunities, createOpportunity, getPipeline, updateOpportunity, deleteOpportunity
} = require('../controllers/opportunitiesController');
const { authenticate } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');

/**
 * @swagger
 * /opportunities:
 *   get:
 *     tags: [Opportunities]
 *     summary: List opportunities
 *     parameters:
 *       - in: query
 *         name: lead_id
 *         schema: { type: integer }
 *       - in: query
 *         name: stage
 *         schema: { type: string }
 *       - in: query
 *         name: agent_id
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of opportunities
 */
router.get('/', authenticate, getOpportunities);

/**
 * @swagger
 * /opportunities:
 *   post:
 *     tags: [Opportunities]
 *     summary: Create an opportunity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lead_id, stage, premium_amount, probability]
 *             properties:
 *               lead_id: { type: integer }
 *               stage: { type: string }
 *               premium_amount: { type: number }
 *               probability: { type: integer, minimum: 0, maximum: 100 }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Opportunity created
 */
router.post(
  '/',
  authenticate,
  auditMiddleware,
  [
    body('lead_id').isInt({ min: 1 }).withMessage('Valid lead_id is required'),
    body('stage').trim().notEmpty().withMessage('Stage is required'),
    body('premium_amount').isFloat({ min: 0 }).withMessage('Valid premium_amount is required'),
    body('probability').isInt({ min: 0, max: 100 }).withMessage('Probability must be 0-100')
  ],
  createOpportunity
);

/**
 * @swagger
 * /opportunities/pipeline:
 *   get:
 *     tags: [Opportunities]
 *     summary: Get opportunity pipeline aggregated by stage
 *     parameters:
 *       - in: query
 *         name: agent_id
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pipeline grouped by stage
 */
router.get('/pipeline', authenticate, getPipeline);

/**
 * @swagger
 * /opportunities/{id}:
 *   put:
 *     tags: [Opportunities]
 *     summary: Update an opportunity
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Opportunity updated
 */
router.put(
  '/:id',
  authenticate,
  auditMiddleware,
  [
    body('premium_amount').optional().isFloat({ min: 0 }),
    body('probability').optional().isInt({ min: 0, max: 100 })
  ],
  updateOpportunity
);

/**
 * @swagger
 * /opportunities/{id}:
 *   delete:
 *     tags: [Opportunities]
 *     summary: Delete an opportunity
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Opportunity deleted
 */
router.delete('/:id', authenticate, auditMiddleware, deleteOpportunity);

module.exports = router;
