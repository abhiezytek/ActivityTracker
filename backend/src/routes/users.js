const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getUsers, createUser, getUserById, updateUser, deleteUser } = require('../controllers/usersController');
const { authenticate, authorize } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     parameters:
 *       - in: query
 *         name: role_id
 *         schema: { type: integer }
 *       - in: query
 *         name: branch_id
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: is_active
 *         schema: { type: integer, enum: [0, 1] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', authenticate, authorize('Admin', 'Branch Manager', 'Team Leader'), getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a user (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role_id]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role_id: { type: integer }
 *               branch_id: { type: integer }
 *     responses:
 *       201:
 *         description: User created
 */
router.post(
  '/',
  authenticate,
  authorize('Admin'),
  auditMiddleware,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role_id').isInt({ min: 1 }).withMessage('Valid role_id is required'),
    body('branch_id').optional().isInt({ min: 1 })
  ],
  createUser
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/:id', authenticate, getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user (Admin only)
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
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               role_id: { type: integer }
 *               branch_id: { type: integer }
 *               is_active: { type: integer }
 *     responses:
 *       200:
 *         description: User updated
 */
router.put(
  '/:id',
  authenticate,
  authorize('Admin'),
  auditMiddleware,
  [
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('role_id').optional().isInt({ min: 1 }),
    body('branch_id').optional().isInt({ min: 1 }),
    body('is_active').optional().isIn([0, 1])
  ],
  updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate user (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.delete('/:id', authenticate, authorize('Admin'), auditMiddleware, deleteUser);

module.exports = router;
