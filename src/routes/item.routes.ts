import express from 'express';
import { ItemController } from '../controllers/item.controller';
import { requireAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const itemController = new ItemController();

/**
 * @swagger
 * /items/with-variants:
 *   post:
 *     summary: Create a new item with its variants
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - store
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the item
 *                 example: Latest iPhone model with A15 Bionic chip
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the category
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               store:
 *                 type: string
 *                 enum: [Mini Queen, Lariche]
 *                 description: Store where the item belongs (code will be auto-generated based on this)
 *                 example: Mini Queen
 *               purchasePrice:
 *                 type: number
 *                 format: float
 *                 description: Purchase price of the item
 *                 example: 799.99
 *               sellingPrice:
 *                 type: number
 *                 format: float
 *                 description: Selling price of the item
 *                 example: 999.99
 *               minStockLevel:
 *                 type: number
 *                 description: Minimum stock level
 *                 example: 10
 *               maxStockLevel:
 *                 type: number
 *                 description: Maximum stock level
 *                 example: 100
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *                 example: Includes charger and earphones
 *               variantGroups:
 *                 type: object
 *                 description: "Variant groups to generate combinations (e.g., color: Red, Blue; size: M, L, XL)"
 *                 example: {"color": ["Red", "Blue"], "size": ["M", "L", "XL"]}
 *               variantDefaults:
 *                 type: object
 *                 description: Default values for all variants (optional)
 *                 properties:
 *                   purchasePrice:
 *                     type: number
 *                     format: float
 *                     description: Default purchase price for all variants
 *                   sellingPrice:
 *                     type: number
 *                     format: float
 *                     description: Default selling price for all variants
 *                   stockQuantity:
 *                     type: number
 *                     description: Default stock quantity for all variants
 *                   minStockLevel:
 *                     type: number
 *                     description: Default minimum stock level for all variants
 *                   maxStockLevel:
 *                     type: number
 *                     description: Default maximum stock level for all variants
 *                   imageUrl:
 *                     type: string
 *                     description: Default image URL for all variants
 *                   notes:
 *                     type: string
 *                     description: Default notes for all variants
 *     responses:
 *       201:
 *         description: Item created successfully with variants
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
 *                     item:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         code:
 *                           type: string
 *                           description: Auto-generated code in format SSS-YY-XXXX
 *                           example: MQN-24-0001
 *                         description:
 *                           type: string
 *                           example: Latest iPhone model with A15 Bionic chip
 *                         categoryId:
 *                           type: string
 *                           format: uuid
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         store:
 *                           type: string
 *                           enum: [Mini Queen, Lariche]
 *                           example: Mini Queen
 *                         purchasePrice:
 *                           type: number
 *                           format: float
 *                           example: 799.99
 *                         sellingPrice:
 *                           type: number
 *                           format: float
 *                           example: 999.99
 *                         minStockLevel:
 *                           type: number
 *                           example: 10
 *                         maxStockLevel:
 *                           type: number
 *                           example: 100
 *                         notes:
 *                           type: string
 *                           example: Includes charger and earphones
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
 *                         variants:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                                 example: 123e4567-e89b-12d3-a456-426614174000
 *                               code:
 *                                 type: string
 *                                 example: IP13-128-BLK
 *                               sku:
 *                                 type: string
 *                                 example: IP13-128-BLK-SKU
 *                               barcode:
 *                                 type: string
 *                                 example: 123456789013
 *                               purchasePrice:
 *                                 type: number
 *                                 format: float
 *                                 example: 799.99
 *                               sellingPrice:
 *                                 type: number
 *                                 format: float
 *                                 example: 999.99
 *                               stockQuantity:
 *                                 type: number
 *                                 example: 50
 *                               minStockLevel:
 *                                 type: number
 *                                 example: 5
 *                               maxStockLevel:
 *                                 type: number
 *                                 example: 50
 *                               attributes:
 *                                 type: object
 *                                 example: { "color": "Black", "storage": "128GB" }
 *                               notes:
 *                                 type: string
 *                                 example: Limited edition color
 *                               isActive:
 *                                 type: boolean
 *                                 example: true
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: 2024-03-20T10:00:00Z
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: 2024-03-20T10:00:00Z
 *       400:
 *         description: Invalid input or duplicate codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Item code already exists
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: You are not logged in
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Category not found
 */
router.post('/with-variants', requireAuthMiddleware, itemController.createWithVariants);

/**
 * @swagger
 * /items/search:
 *   get:
 *     summary: Search items with variants
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for item name, code, description, barcode, or SKU
 *         example: iphone
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum selling price
 *         example: 100.00
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum selling price
 *         example: 1000.00
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter items with stock quantity greater than 0
 *         example: true
 *       - in: query
 *         name: hasVariants
 *         schema:
 *           type: boolean
 *         description: Filter items that have variants
 *         example: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of items to skip
 *         example: 0
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
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
 *                     items:
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
 *                             example: iPhone 13
 *                           code:
 *                             type: string
 *                             example: IPHONE-13
 *                           description:
 *                             type: string
 *                             example: Latest iPhone model with A15 Bionic chip
 *                           categoryId:
 *                             type: string
 *                             format: uuid
 *                             example: 123e4567-e89b-12d3-a456-426614174000
 *                           purchasePrice:
 *                             type: number
 *                             format: float
 *                             example: 799.99
 *                           sellingPrice:
 *                             type: number
 *                             format: float
 *                             example: 999.99
 *                           minStockLevel:
 *                             type: number
 *                             example: 10
 *                           maxStockLevel:
 *                             type: number
 *                             example: 100
 *                           notes:
 *                             type: string
 *                             example: Includes charger and earphones
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
 *                           variants:
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
 *                                   example: iPhone 13 128GB Black
 *                                 code:
 *                                   type: string
 *                                   example: IP13-128-BLK
 *                                 sku:
 *                                   type: string
 *                                   example: IP13-128-BLK-SKU
 *                                 barcode:
 *                                   type: string
 *                                   example: 123456789013
 *                                 purchasePrice:
 *                                   type: number
 *                                   format: float
 *                                   example: 799.99
 *                                 sellingPrice:
 *                                   type: number
 *                                   format: float
 *                                   example: 999.99
 *                                 stockQuantity:
 *                                   type: number
 *                                   example: 50
 *                                 minStockLevel:
 *                                   type: number
 *                                   example: 5
 *                                 maxStockLevel:
 *                                   type: number
 *                                   example: 50
 *                                 attributes:
 *                                   type: object
 *                                   example: { "color": "Black", "storage": "128GB" }
 *                                 notes:
 *                                   type: string
 *                                   example: Limited edition color
 *                                 isActive:
 *                                   type: boolean
 *                                   example: true
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                   example: 2024-03-20T10:00:00Z
 *                                 updatedAt:
 *                                   type: string
 *                                   format: date-time
 *                                   example: 2024-03-20T10:00:00Z
 *                     total:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     offset:
 *                       type: integer
 *                       example: 0
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: You are not logged in
 */
router.get('/search', requireAuthMiddleware, itemController.search);

export default router;
