import express from 'express';
import authRoutes from './auth.routes';
import purchaseOrderRoutes from './purchaseOrder.routes';
import saleRoutes from './sale.routes';
import itemRoutes from './item.routes';
import docsRoutes from './docs';
import customerRoutes from './customer.routes';
import categoryRoutes from './category.routes';
import uploadRoutes from './upload.routes';

const router = express.Router();

// Health check route
router.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation
router.use('/docs', docsRoutes);

// API routes
router.use('/auth', authRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/sales', saleRoutes);
router.use('/items', itemRoutes);
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);

export default router;
