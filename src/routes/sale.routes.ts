import express from 'express';
import { SaleController } from '../controllers/sale.controller';
import { requireAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const saleController = new SaleController();

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
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
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of existing customer
 *               newCustomer:
 *                 type: object
 *                 description: Customer details if creating new customer
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *                   taxNumber:
 *                     type: string
 *                   creditLimit:
 *                     type: number
 *                     format: float
 *                   notes:
 *                     type: string
 *               items:
 *                 type: array
 *                 description: List of items in the sale
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
 *                     itemVariantId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *                     unitPrice:
 *                       type: number
 *                       format: float
 *                     discountAmount:
 *                       type: number
 *                       format: float
 *                     taxAmount:
 *                       type: number
 *                       format: float
 *                     notes:
 *                       type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CARD, BANK_TRANSFER, CREDIT]
 *               paymentStatus:
 *                 type: string
 *                 enum: [PAID, PENDING]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
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
 *                     sale:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         clerkUserId:
 *                           type: string
 *                           format: uuid
 *                         customerId:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                           enum: [COMPLETED, CANCELLED, REFUNDED]
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
 *                         paymentMethod:
 *                           type: string
 *                         paymentStatus:
 *                           type: string
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
 *                               discountAmount:
 *                                 type: number
 *                                 format: float
 *                               taxAmount:
 *                                 type: number
 *                                 format: float
 *                               subtotal:
 *                                 type: number
 *                                 format: float
 *                               total:
 *                                 type: number
 *                                 format: float
 *                               notes:
 *                                 type: string
 *       400:
 *         description: Invalid input or insufficient stock
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
 *         description: Customer or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', requireAuthMiddleware, saleController.create);

export default router;
