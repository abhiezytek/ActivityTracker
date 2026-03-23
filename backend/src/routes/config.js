const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getRoles, createRole, updateRole, deleteRole,
  getProductTypes, createProductType, updateProductType, deleteProductType,
  getLeadSubStatuses, createLeadSubStatus, updateLeadSubStatus, deleteLeadSubStatus
} = require('../controllers/configController');
const { authenticate, authorize } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');

const adminOnly = [authenticate, authorize('Admin')];

// ── Roles ─────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /config/roles:
 *   get:
 *     tags: [Config]
 *     summary: List all roles
 *     responses:
 *       200:
 *         description: List of roles
 */
router.get('/roles', ...adminOnly, getRoles);

/**
 * @swagger
 * /config/roles:
 *   post:
 *     tags: [Config]
 *     summary: Create a role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               permissions: { type: object }
 *     responses:
 *       201:
 *         description: Role created
 */
router.post(
  '/roles',
  ...adminOnly,
  auditMiddleware,
  [body('name').trim().notEmpty().withMessage('Role name is required')],
  createRole
);

/**
 * @swagger
 * /config/roles/{id}:
 *   put:
 *     tags: [Config]
 *     summary: Update a role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put('/roles/:id', ...adminOnly, auditMiddleware, updateRole);

/**
 * @swagger
 * /config/roles/{id}:
 *   delete:
 *     tags: [Config]
 *     summary: Delete a role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Role deleted
 */
router.delete('/roles/:id', ...adminOnly, auditMiddleware, deleteRole);

// ── Product Types ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /config/product-types:
 *   get:
 *     tags: [Config]
 *     summary: List all product types
 *     responses:
 *       200:
 *         description: List of product types
 */
router.get('/product-types', ...adminOnly, getProductTypes);

/**
 * @swagger
 * /config/product-types:
 *   post:
 *     tags: [Config]
 *     summary: Create a product type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Product type created
 */
router.post(
  '/product-types',
  ...adminOnly,
  auditMiddleware,
  [body('name').trim().notEmpty().withMessage('Product type name is required')],
  createProductType
);

/**
 * @swagger
 * /config/product-types/{id}:
 *   put:
 *     tags: [Config]
 *     summary: Update a product type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product type updated
 */
router.put('/product-types/:id', ...adminOnly, auditMiddleware, updateProductType);

/**
 * @swagger
 * /config/product-types/{id}:
 *   delete:
 *     tags: [Config]
 *     summary: Deactivate a product type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product type deactivated
 */
router.delete('/product-types/:id', ...adminOnly, auditMiddleware, deleteProductType);

// ── Lead Sub-Statuses ─────────────────────────────────────────────────────────

/**
 * @swagger
 * /config/lead-sub-statuses:
 *   get:
 *     tags: [Config]
 *     summary: List lead sub-statuses
 *     parameters:
 *       - in: query
 *         name: lead_status
 *         schema: { type: string, enum: [New, Contacted, Qualified, Proposal, Closed] }
 *     responses:
 *       200:
 *         description: List of lead sub-statuses
 */
router.get('/lead-sub-statuses', ...adminOnly, getLeadSubStatuses);

/**
 * @swagger
 * /config/lead-sub-statuses:
 *   post:
 *     tags: [Config]
 *     summary: Create a lead sub-status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lead_status, sub_status_name]
 *             properties:
 *               lead_status: { type: string, enum: [New, Contacted, Qualified, Proposal, Closed] }
 *               sub_status_name: { type: string }
 *     responses:
 *       201:
 *         description: Lead sub-status created
 */
router.post(
  '/lead-sub-statuses',
  ...adminOnly,
  auditMiddleware,
  [
    body('lead_status').isIn(['New', 'Contacted', 'Qualified', 'Proposal', 'Closed']).withMessage('Invalid lead_status'),
    body('sub_status_name').trim().notEmpty().withMessage('sub_status_name is required')
  ],
  createLeadSubStatus
);

/**
 * @swagger
 * /config/lead-sub-statuses/{id}:
 *   put:
 *     tags: [Config]
 *     summary: Update a lead sub-status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lead sub-status updated
 */
router.put(
  '/lead-sub-statuses/:id',
  ...adminOnly,
  auditMiddleware,
  [
    body('lead_status').optional().isIn(['New', 'Contacted', 'Qualified', 'Proposal', 'Closed']),
    body('is_active').optional().isIn([0, 1])
  ],
  updateLeadSubStatus
);

/**
 * @swagger
 * /config/lead-sub-statuses/{id}:
 *   delete:
 *     tags: [Config]
 *     summary: Deactivate a lead sub-status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lead sub-status deactivated
 */
router.delete('/lead-sub-statuses/:id', ...adminOnly, auditMiddleware, deleteLeadSubStatus);

module.exports = router;
