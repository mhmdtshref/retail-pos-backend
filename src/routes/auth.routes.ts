import express from 'express';
// import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { AuthController } from '../controllers/auth.controller';
import { requireAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const authController = new AuthController();

// Get current user profile
router.get('/me', requireAuthMiddleware, authController.getProfile);

export default router;
