const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const router = express.Router();
const {
  getLeads, createLead, getLeadById, updateLead, deleteLead, uploadLeads, assignLead
} = require('../controllers/leadsController');
const { authenticate, authorize } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * @swagger
 * /leads:
 *   get:
 *     tags: [Leads]
 *     summary: List leads (role-based filtering)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [New, Contacted, Qualified, Proposal, Closed] }
 *       - in: query
 *         name: product_type_id
 *         schema: { type: integer }
 *       - in: query
 *         name: assigned_to
 *         schema: { type: integer }
 *       - in: query
 *         name: source
 *         schema: { type: string, enum: [online, referral, walk-in] }
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
 *         description: Paginated list of leads
 */
router.get('/', authenticate, getLeads);

/**
 * @swagger
 * /leads:
 *   post:
 *     tags: [Leads]
 *     summary: Create a lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_name, phone, source]
 *             properties:
 *               customer_name: { type: string }
 *               phone: { type: string }
 *               email: { type: string, format: email }
 *               product_type_id: { type: integer }
 *               source: { type: string, enum: [online, referral, walk-in] }
 *               sub_status: { type: string }
 *               assigned_to: { type: integer }
 *     responses:
 *       201:
 *         description: Lead created
 */
router.post(
  '/',
  authenticate,
  auditMiddleware,
  [
    body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('source').isIn(['website', 'referral', 'cold_call', 'social_media', 'advertisement', 'agent', 'other']).withMessage('Invalid source'),
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
    body('product_type_id').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body('assigned_to').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 })
  ],
  createLead
);

/**
 * @swagger
 * /leads/upload:
 *   post:
 *     tags: [Leads]
 *     summary: Bulk upload leads via Excel file
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload result with inserted/skipped counts
 */
router.post(
  '/upload',
  authenticate,
  authorize('Admin', 'Branch Manager', 'Team Leader'),
  upload.single('file'),
  uploadLeads
);

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     tags: [Leads]
 *     summary: Get lead by ID with activities
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lead details with activities
 */
router.get('/:id', authenticate, getLeadById);

/**
 * @swagger
 * /leads/{id}:
 *   put:
 *     tags: [Leads]
 *     summary: Update a lead
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lead updated
 */
router.put(
  '/:id',
  authenticate,
  auditMiddleware,
  [
    body('source').optional().isIn(['website', 'referral', 'cold_call', 'social_media', 'advertisement', 'agent', 'other']),
    body('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
    body('email').optional().isEmail().normalizeEmail(),
    body('product_type_id').optional().isInt({ min: 1 }),
    body('assigned_to').optional().isInt({ min: 1 })
  ],
  updateLead
);

/**
 * @swagger
 * /leads/{id}:
 *   delete:
 *     tags: [Leads]
 *     summary: Soft-delete a lead
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lead deleted
 */
router.delete('/:id', authenticate, authorize('Admin', 'Branch Manager'), auditMiddleware, deleteLead);

/**
 * @swagger
 * /leads/{id}/assign:
 *   post:
 *     tags: [Leads]
 *     summary: Assign lead to an agent
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assigned_to]
 *             properties:
 *               assigned_to: { type: integer }
 *     responses:
 *       200:
 *         description: Lead assigned
 */
router.post(
  '/:id/assign',
  authenticate,
  authorize('Admin', 'Branch Manager', 'Team Leader'),
  auditMiddleware,
  [body('assigned_to').isInt({ min: 1 }).withMessage('Valid user ID is required')],
  assignLead
);

module.exports = router;
