import express from 'express';
import { PurchaseOrderController } from '../controllers/purchaseOrder.controller';
import { requireAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const purchaseOrderController = new PurchaseOrderController();

/**
 * @swagger
 * /purchase-orders:
 *   get:
 *     summary: Get all purchase orders with pagination
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ORDERED, RECEIVED, CANCELLED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of purchase orders retrieved successfully
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
 *                     purchaseOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           clerkUserId:
 *                             type: string
 *                             format: uuid
 *                           status:
 *                             type: string
 *                           expectedDeliveryDate:
 *                             type: string
 *                             format: date
 *                           totalAmount:
 *                             type: number
 *                             format: float
 *                           notes:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date
 *                 description: Expected delivery date
 *               items:
 *                 type: array
 *                 description: List of items in the purchase order
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the item
 *                     itemVariantId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the item variant (optional)
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *                       description: Quantity to order
 *                     unitPrice:
 *                       type: number
 *                       format: float
 *                       description: Unit price for the item
 *                     discountAmount:
 *                       type: number
 *                       format: float
 *                       description: Discount amount for this item (optional)
 *                       default: 0
 *                     taxAmount:
 *                       type: number
 *                       format: float
 *                       description: Tax amount for this item (optional)
 *                       default: 0
 *                     notes:
 *                       type: string
 *                       description: Notes for this item (optional)
 *               notes:
 *                 type: string
 *                 description: Additional notes for the purchase order
 *     responses:
 *       201:
 *         description: Purchase order created successfully
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
 *                     purchaseOrder:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         orderNumber:
 *                           type: string
 *                           description: Auto-generated order number in format PO-YY-XXXX
 *                           example: PO-24-0001
 *                         clerkUserId:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                           enum: [DRAFT, ORDERED, RECEIVED, CANCELLED]
 *                         orderDate:
 *                           type: string
 *                           format: date-time
 *                         expectedDeliveryDate:
 *                           type: string
 *                           format: date
 *                         totalAmount:
 *                           type: number
 *                           format: float
 *                         taxAmount:
 *                           type: number
 *                           format: float
 *                         discountAmount:
 *                           type: number
 *                           format: float
 *                         finalAmount:
 *                           type: number
 *                           format: float
 *                         notes:
 *                           type: string
 *                         items:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               itemId:
 *                                 type: string
 *                                 format: uuid
 *                               itemVariantId:
 *                                 type: string
 *                                 format: uuid
 *                               quantity:
 *                                 type: number
 *                               unitPrice:
 *                                 type: number
 *                               subtotal:
 *                                 type: number
 *                               notes:
 *                                 type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', requireAuthMiddleware, purchaseOrderController.getAll);
router.post('/', requireAuthMiddleware, purchaseOrderController.create);

/**
 * @swagger
 * /purchase-orders/{id}:
 *   get:
 *     summary: Get a single purchase order by ID
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order retrieved successfully
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
 *                     purchaseOrder:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         orderNumber:
 *                           type: string
 *                           description: Auto-generated order number in format PO-YY-XXXX
 *                           example: PO-24-0001
 *                         clerkUserId:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                           enum: [DRAFT, ORDERED, RECEIVED, CANCELLED]
 *                         expectedDeliveryDate:
 *                           type: string
 *                           format: date
 *                         totalAmount:
 *                           type: number
 *                           format: float
 *                         taxAmount:
 *                           type: number
 *                           format: float
 *                         discountAmount:
 *                           type: number
 *                           format: float
 *                         finalAmount:
 *                           type: number
 *                           format: float
 *                         notes:
 *                           type: string
 *                         items:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               itemId:
 *                                 type: string
 *                                 format: uuid
 *                               itemVariantId:
 *                                 type: string
 *                                 format: uuid
 *                               quantity:
 *                                 type: number
 *                               unitPrice:
 *                                 type: number
 *                                 format: float
 *                               subtotal:
 *                                 type: number
 *                                 format: float
 *                               notes:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Purchase order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', requireAuthMiddleware, purchaseOrderController.getById);

/**
 * @swagger
 * /purchase-orders/{id}/status:
 *   patch:
 *     summary: Update purchase order status
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Purchase order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ORDERED, RECEIVED, CANCELLED]
 *                 description: New status for the purchase order
 *     responses:
 *       200:
 *         description: Purchase order status updated successfully
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
 *                     purchaseOrder:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         orderNumber:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [DRAFT, ORDERED, RECEIVED, CANCELLED]
 *                         orderDate:
 *                           type: string
 *                           format: date-time
 *                         actualDeliveryDate:
 *                           type: string
 *                           format: date-time
 *                         items:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               itemId:
 *                                 type: string
 *                                 format: uuid
 *                               itemVariantId:
 *                                 type: string
 *                                 format: uuid
 *                               quantity:
 *                                 type: number
 *                               receivedQuantity:
 *                                 type: number
 *       400:
 *         description: Invalid status transition or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Purchase order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/status', requireAuthMiddleware, purchaseOrderController.updateStatus);

export default router;
