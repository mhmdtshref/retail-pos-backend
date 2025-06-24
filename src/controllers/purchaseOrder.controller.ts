import { Request, Response, NextFunction } from 'express';
import PurchaseOrder, { PurchaseOrderStatus } from '../models/PurchaseOrder';
import PurchaseOrderItem from '../models/PurchaseOrderItem';
import Item from '../models/Item';
import ItemVariant from '../models/ItemVariant';
import ItemMovement, { MovementType, MovementStatus } from '../models/ItemMovement';
import sequelize from '../config/database';
import { AppError } from '../utils/error';
import { Op } from 'sequelize';
import { isAuthenticatedRequest } from '../types/auth';
import { PurchaseOrderGeneratorService } from '../services/purchaseOrderGenerator.service';

export class PurchaseOrderController {
  // Get all purchase orders with pagination
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const { search, status, startDate, endDate } = req.query;

      const where: any = {};

      // Add search condition if provided
      if (search) {
        where[Op.or] = [
          { orderNumber: { [Op.iLike]: `%${search}%` } },
          { notes: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Filter by status if provided
      if (status) {
        where.status = status;
      }

      // Filter by date range if provided
      if (startDate || endDate) {
        where.orderDate = {};
        if (startDate) {
          where.orderDate[Op.gte] = new Date(startDate as string);
        }
        if (endDate) {
          where.orderDate[Op.lte] = new Date(endDate as string);
        }
      }

      const { count, rows: purchaseOrders } = await PurchaseOrder.findAndCountAll({
        where,
        include: [
          {
            model: PurchaseOrderItem,
            as: 'items',
            include: [
              { model: Item, as: 'item' },
              { model: ItemVariant, as: 'itemVariant' },
            ],
          },
        ],
        order: [['orderDate', 'DESC']],
        limit,
        offset,
      });

      res.json({
        status: 'success',
        data: {
          purchaseOrders,
          pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get a single purchase order by ID
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(req.params.id, {
        include: [
          {
            model: PurchaseOrderItem,
            as: 'items',
            include: [
              { model: Item, as: 'item' },
              { model: ItemVariant, as: 'itemVariant' },
            ],
          },
        ],
      });

      if (!purchaseOrder) {
        throw new AppError('Purchase order not found', 404);
      }

      res.json({
        status: 'success',
        data: {
          purchaseOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Create a new purchase order
  create = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      if (!isAuthenticatedRequest(req)) {
        throw new AppError('You are not logged in.', 401);
      }

      const { expectedDeliveryDate, notes, items } = req.body;

      // Validate items array
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new AppError('Purchase order must have at least one item', 400);
      }

      // Validate each item
      for (const item of items) {
        if (!item.itemId) {
          throw new AppError('Item ID is required for all items', 400);
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new AppError('Quantity must be greater than 0 for all items', 400);
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          throw new AppError('Unit price must be greater than 0 for all items', 400);
        }

        // Validate item exists
        const existingItem = await Item.findByPk(item.itemId, { transaction });
        if (!existingItem) {
          throw new AppError(`Item with ID ${item.itemId} not found`, 404);
        }

        // Validate variant if provided
        if (item.itemVariantId) {
          const existingVariant = await ItemVariant.findByPk(item.itemVariantId, { transaction });
          if (!existingVariant) {
            throw new AppError(`Item variant with ID ${item.itemVariantId} not found`, 404);
          }
          if (existingVariant.itemId !== item.itemId) {
            throw new AppError(`Item variant ${item.itemVariantId} does not belong to item ${item.itemId}`, 400);
          }
        }
      }

      // Generate automatic order number
      const orderNumber = await PurchaseOrderGeneratorService.generateOrderNumber();

      // Calculate totals
      let totalAmount = 0;
      let taxAmount = 0;
      let discountAmount = 0;

      // Create purchase order items and calculate totals
      const purchaseOrderItems = await Promise.all(
        items.map(async (item) => {
          const {
            itemId,
            itemVariantId,
            quantity,
            unitPrice,
            discountAmount: itemDiscount = 0,
            taxAmount: itemTax = 0,
            notes: itemNotes,
          } = item;

          const subtotal = quantity * unitPrice;
          const total = subtotal - itemDiscount + itemTax;

          totalAmount += subtotal;
          taxAmount += itemTax;
          discountAmount += itemDiscount;

          return {
            itemId,
            itemVariantId,
            quantity,
            unitPrice,
            discountAmount: itemDiscount,
            taxAmount: itemTax,
            subtotal,
            total,
            notes: itemNotes,
            receivedQuantity: 0,
          };
        }),
      );

      const finalAmount = totalAmount - discountAmount + taxAmount;

      // Create purchase order
      const purchaseOrder = await PurchaseOrder.create(
        {
          clerkUserId: req.auth?.user?.id,
          orderNumber,
          status: PurchaseOrderStatus.DRAFT,
          orderDate: new Date(),
          expectedDeliveryDate,
          totalAmount,
          taxAmount,
          discountAmount,
          finalAmount,
          notes,
        },
        { transaction },
      );

      // Create purchase order items
      await Promise.all(
        purchaseOrderItems.map((item) =>
          PurchaseOrderItem.create(
            {
              ...item,
              purchaseOrderId: purchaseOrder.id,
            },
            { transaction },
          ),
        ),
      );

      // Commit transaction
      await transaction.commit();

      // Fetch the complete purchase order with items
      const completePurchaseOrder = await PurchaseOrder.findByPk(purchaseOrder.id, {
        include: [
          {
            model: PurchaseOrderItem,
            as: 'items',
            include: [
              { model: Item, as: 'item' },
              { model: ItemVariant, as: 'itemVariant' },
            ],
          },
        ],
      });

      res.status(201).json({
        status: 'success',
        data: {
          purchaseOrder: completePurchaseOrder,
        },
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      next(error);
    }
  };

  // Update purchase order status
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      if (!isAuthenticatedRequest(req)) {
        throw new AppError('You are not logged in.', 401);
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!Object.values(PurchaseOrderStatus).includes(status)) {
        throw new AppError('Invalid status value', 400);
      }

      // Find purchase order with items
      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        include: [
          {
            model: PurchaseOrderItem,
            as: 'items',
            include: [
              { model: Item, as: 'item' },
              { model: ItemVariant, as: 'itemVariant' },
            ],
          },
        ],
        transaction,
      });

      if (!purchaseOrder) {
        throw new AppError('Purchase order not found', 404);
      }

      // Validate status transition
      const currentStatus = purchaseOrder.status;
      const newStatus = status as PurchaseOrderStatus;

      // Define valid status transitions
      const validTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
        DRAFT: [PurchaseOrderStatus.ORDERED, PurchaseOrderStatus.CANCELLED],
        ORDERED: [PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED],
        RECEIVED: [PurchaseOrderStatus.CANCELLED], // Can only cancel after receiving
        CANCELLED: [], // No further transitions from cancelled
      };

      if (!validTransitions[currentStatus].includes(newStatus)) {
        throw new AppError(
          `Invalid status transition from ${currentStatus} to ${newStatus}`,
          400
        );
      }

      // Handle special logic for RECEIVED status
      if (newStatus === PurchaseOrderStatus.RECEIVED) {
        await this.handlePurchaseOrderReceived(purchaseOrder, transaction);
      }

      // Update the status
      await purchaseOrder.update({ status: newStatus }, { transaction });

      // Commit transaction
      await transaction.commit();

      // Fetch updated purchase order
      const updatedPurchaseOrder = await PurchaseOrder.findByPk(id, {
        include: [
          {
            model: PurchaseOrderItem,
            as: 'items',
            include: [
              { model: Item, as: 'item' },
              { model: ItemVariant, as: 'itemVariant' },
            ],
          },
        ],
      });

      res.json({
        status: 'success',
        data: {
          purchaseOrder: updatedPurchaseOrder,
        },
      });
    } catch (error) {
      console.log('error:', error);
      // Rollback transaction on error
      await transaction.rollback();
      next(error);
    }
  };

  // Handle purchase order received - update inventory
  private handlePurchaseOrderReceived = async (purchaseOrder: any, transaction: any) => {
    for (const item of purchaseOrder.items) {
      const { itemId, itemVariantId, quantity, unitPrice } = item;
      console.log('{ itemId, itemVariantId, quantity, unitPrice }:', { itemId, itemVariantId, quantity, unitPrice });

      if (itemVariantId) {
        // Update variant stock
        const variant = await ItemVariant.findByPk(itemVariantId, { transaction });
        console.log('variant:', variant);
        if (variant) {
          const previousQuantity = variant.stockQuantity;
          const newQuantity = previousQuantity + quantity;
          
          await variant.update(
            { 
              stockQuantity: newQuantity,
              purchasePrice: unitPrice // Update purchase price
            },
            { transaction }
          );

          // Create item movement record
          await ItemMovement.create(
            {
              clerkUserId: purchaseOrder.clerkUserId,
              itemId,
              itemVariantId,
              movementType: MovementType.PURCHASE,
              status: MovementStatus.COMPLETED,
              quantity,
              previousQuantity,
              newQuantity,
              referenceType: 'PURCHASE_ORDER',
              referenceId: purchaseOrder.id,
              notes: `Purchase order received: ${purchaseOrder.orderNumber}`,
            },
            { transaction }
          );
        }
      } else {
        // For items without variants, we don't update stock at item level
        // Only create movement record for tracking
        const mainItem = await Item.findByPk(itemId, { transaction });
        if (mainItem) {
          // Update purchase price
          await mainItem.update(
            { purchasePrice: unitPrice },
            { transaction }
          );

          // Create item movement record (no stock update for main item)
          await ItemMovement.create(
            {
              clerkUserId: purchaseOrder.clerkUserId,
              itemId,
              movementType: MovementType.PURCHASE,
              status: MovementStatus.COMPLETED,
              quantity,
              previousQuantity: 0, // No stock at item level
              newQuantity: 0, // No stock at item level
              referenceType: 'PURCHASE_ORDER',
              referenceId: purchaseOrder.id,
              notes: `Purchase order received: ${purchaseOrder.orderNumber} (no stock update - item has variants)`,
            },
            { transaction }
          );
        }
      }

      // Update received quantity
      await item.update(
        { receivedQuantity: quantity },
        { transaction }
      );
    }

    // Update actual delivery date
    await purchaseOrder.update(
      { actualDeliveryDate: new Date() },
      { transaction }
    );
  };
}
