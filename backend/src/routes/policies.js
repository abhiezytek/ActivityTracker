const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getPolicies, createPolicy, getRenewals, updatePolicy, deletePolicy } = require('../controllers/policiesController');
const { authenticate, authorize } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');

/**
 * @swagger
 * /policies:
 *   get:
 *     tags: [Policies]
 *     summary: List policies (role-based)
 *     parameters:
 *       - in: query
 *         name: product_type_id
 *         schema: { type: integer }
 *       - in: query
 *         name: agent_id
 *         schema: { type: integer }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of policies
 */
router.get('/', authenticate, getPolicies);

/**
 * @swagger
 * /policies:
 *   post:
 *     tags: [Policies]
 *     summary: Create a policy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_name, policy_number, product_type_id, premium, start_date, end_date, agent_id]
 *             properties:
 *               customer_name: { type: string }
 *               policy_number: { type: string }
 *               lead_id: { type: integer }
 *               product_type_id: { type: integer }
 *               premium: { type: number }
 *               start_date: { type: string, format: date }
 *               end_date: { type: string, format: date }
 *               agent_id: { type: integer }
 *     responses:
 *       201:
 *         description: Policy created
 */
router.post(
  '/',
  authenticate,
  auditMiddleware,
  [
    body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    body('policy_number').trim().notEmpty().withMessage('Policy number is required'),
    body('product_type_id').isInt({ min: 1 }).withMessage('Valid product_type_id is required'),
    body('premium').isFloat({ min: 0 }).withMessage('Valid premium is required'),
    body('start_date').isISO8601().withMessage('Valid start_date is required'),
    body('end_date').isISO8601().withMessage('Valid end_date is required'),
    body('agent_id').isInt({ min: 1 }).withMessage('Valid agent_id is required'),
    body('lead_id').optional().isInt({ min: 1 })
  ],
  createPolicy
);

/**
 * @swagger
 * /policies/renewals:
 *   get:
 *     tags: [Policies]
 *     summary: Get policies expiring in next 30/60/90 days
 *     parameters:
 *       - in: query
 *         name: agent_id
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Renewal groupings due_in_30, due_in_60, due_in_90
 */
router.get('/renewals', authenticate, getRenewals);

/**
 * @swagger
 * /policies/{id}:
 *   put:
 *     tags: [Policies]
 *     summary: Update a policy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Policy updated
 */
router.put(
  '/:id',
  authenticate,
  auditMiddleware,
  [
    body('premium').optional().isFloat({ min: 0 }),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('agent_id').optional().isInt({ min: 1 }),
    body('product_type_id').optional().isInt({ min: 1 })
  ],
  updatePolicy
);

/**
 * @swagger
 * /policies/{id}:
 *   delete:
 *     tags: [Policies]
 *     summary: Delete a policy (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Policy deleted
 */
router.delete('/:id', authenticate, authorize('Admin'), auditMiddleware, deletePolicy);

module.exports = router;
