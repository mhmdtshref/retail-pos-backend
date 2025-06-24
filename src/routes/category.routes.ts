import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { requireAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category
 *                 example: Electronics
 *               code:
 *                 type: string
 *                 description: Unique code for the category
 *                 example: ELEC
 *               description:
 *                 type: string
 *                 description: Description of the category
 *                 example: Electronic devices and accessories
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the parent category (optional)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         name:
 *                           type: string
 *                           example: Electronics
 *                         code:
 *                           type: string
 *                           example: ELEC
 *                         description:
 *                           type: string
 *                           example: Electronic devices and accessories
 *                         parentId:
 *                           type: string
 *                           format: uuid
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-03-20T10:00:00Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-03-20T10:00:00Z
 *       400:
 *         description: Invalid input or category code already exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Parent category not found
 */
router.post('/', requireAuthMiddleware, categoryController.create);

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for category name, code, or description
 *         example: electronics
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *         example: true
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive child categories in the response
 *         example: false
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: 123e4567-e89b-12d3-a456-426614174000
 *                           name:
 *                             type: string
 *                             example: Electronics
 *                           code:
 *                             type: string
 *                             example: ELEC
 *                           description:
 *                             type: string
 *                             example: Electronic devices and accessories
 *                           parentId:
 *                             type: string
 *                             format: uuid
 *                             example: 123e4567-e89b-12d3-a456-426614174000
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-03-20T10:00:00Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-03-20T10:00:00Z
 *                           parent:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                                 example: 123e4567-e89b-12d3-a456-426614174000
 *                               name:
 *                                 type: string
 *                                 example: Electronics
 *                               code:
 *                                 type: string
 *                                 example: ELEC
 *                           children:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                   example: 123e4567-e89b-12d3-a456-426614174000
 *                                 name:
 *                                   type: string
 *                                   example: Smartphones
 *                                 code:
 *                                   type: string
 *                                   example: ELEC-SMART
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireAuthMiddleware, categoryController.getAll);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         name:
 *                           type: string
 *                           example: Electronics
 *                         code:
 *                           type: string
 *                           example: ELEC
 *                         description:
 *                           type: string
 *                           example: Electronic devices and accessories
 *                         parentId:
 *                           type: string
 *                           format: uuid
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-03-20T10:00:00Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-03-20T10:00:00Z
 *                         parent:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               example: 123e4567-e89b-12d3-a456-426614174000
 *                             name:
 *                               type: string
 *                               example: Electronics
 *                             code:
 *                               type: string
 *                               example: ELEC
 *                         children:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                                 example: 123e4567-e89b-12d3-a456-426614174000
 *                               name:
 *                                 type: string
 *                                 example: Smartphones
 *                               code:
 *                                 type: string
 *                                 example: ELEC-SMART
 *                         items:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                                 example: 123e4567-e89b-12d3-a456-426614174000
 *                               name:
 *                                 type: string
 *                                 example: iPhone 13
 *                               code:
 *                                 type: string
 *                                 example: IPHONE-13
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.get('/:id', requireAuthMiddleware, categoryController.getById);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category
 *                 example: Electronics
 *               code:
 *                 type: string
 *                 description: Unique code for the category
 *                 example: ELEC
 *               description:
 *                 type: string
 *                 description: Description of the category
 *                 example: Electronic devices and accessories
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the parent category
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               isActive:
 *                 type: boolean
 *                 description: Active status of the category
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         name:
 *                           type: string
 *                           example: Electronics
 *                         code:
 *                           type: string
 *                           example: ELEC
 *                         description:
 *                           type: string
 *                           example: Electronic devices and accessories
 *                         parentId:
 *                           type: string
 *                           format: uuid
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-03-20T10:00:00Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2024-03-20T10:00:00Z
 *       400:
 *         description: Invalid input or category code already exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.put('/:id', requireAuthMiddleware, categoryController.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       400:
 *         description: Cannot delete category with active items or child categories
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.delete('/:id', requireAuthMiddleware, categoryController.delete);

export default router; 