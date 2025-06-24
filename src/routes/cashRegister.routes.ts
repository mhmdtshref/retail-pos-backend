import express from 'express';
import { CashRegisterController } from '../controllers/cashRegister.controller';
import { requireAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const cashRegisterController = new CashRegisterController();

/**
 * @swagger
 * /cash-register/open:
 *   post:
 *     summary: Open cash register
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               openingAmount:
 *                 type: number
 *                 format: float
 *                 description: Opening cash amount
 *                 example: 100.00
 *               notes:
 *                 type: string
 *                 description: Opening notes
 *     responses:
 *       201:
 *         description: Cash register opened successfully
 *       400:
 *         description: Cash register already open
 *       401:
 *         description: Unauthorized
 */
router.post('/open', requireAuthMiddleware, cashRegisterController.open);

/**
 * @swagger
 * /cash-register/close:
 *   post:
 *     summary: Close cash register
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actualAmount:
 *                 type: number
 *                 format: float
 *                 description: Actual cash amount in register
 *                 example: 1250.75
 *               notes:
 *                 type: string
 *                 description: Closing notes
 *     responses:
 *       200:
 *         description: Cash register closed successfully
 *       404:
 *         description: No open cash register found
 *       401:
 *         description: Unauthorized
 */
router.post('/close', requireAuthMiddleware, cashRegisterController.close);

/**
 * @swagger
 * /cash-register/status:
 *   get:
 *     summary: Get current cash register status
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cash register status retrieved successfully
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
 *                     isOpen:
 *                       type: boolean
 *                     cashRegister:
 *                       type: object
 *                       nullable: true
 *                     currentBalance:
 *                       type: number
 *                       format: float
 *       401:
 *         description: Unauthorized
 */
router.get('/status', requireAuthMiddleware, cashRegisterController.getStatus);

/**
 * @swagger
 * /cash-register/deposit:
 *   post:
 *     summary: Add money to cash register
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Amount to deposit
 *                 example: 50.00
 *               notes:
 *                 type: string
 *                 description: Deposit notes
 *     responses:
 *       201:
 *         description: Deposit successful
 *       400:
 *         description: Invalid amount or no open register
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No open cash register found
 */
router.post('/deposit', requireAuthMiddleware, cashRegisterController.deposit);

/**
 * @swagger
 * /cash-register/withdraw:
 *   post:
 *     summary: Remove money from cash register
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Amount to withdraw
 *                 example: 25.00
 *               notes:
 *                 type: string
 *                 description: Withdrawal notes
 *     responses:
 *       201:
 *         description: Withdrawal successful
 *       400:
 *         description: Invalid amount or insufficient funds
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No open cash register found
 */
router.post('/withdraw', requireAuthMiddleware, cashRegisterController.withdraw);

/**
 * @swagger
 * /cash-register/history:
 *   get:
 *     summary: Get cash register history
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Cash register history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/history', requireAuthMiddleware, cashRegisterController.getHistory);

export default router; 