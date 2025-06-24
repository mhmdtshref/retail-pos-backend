import { Request, Response, NextFunction } from 'express';
import Sale, { SaleStatus } from '../models/Sale';
import SaleItem from '../models/SaleItem';
import Customer from '../models/Customer';
import Item from '../models/Item';
import ItemVariant from '../models/ItemVariant';
import ItemMovement, { MovementType, MovementStatus } from '../models/ItemMovement';
import sequelize from '../config/database';
import { AppError } from '../utils/error';

export class SaleController {
  // Create a new sale
  create = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { customer, items, paymentMethod, paymentStatus, notes } = req.body;

      // Handle customer logic
      let finalCustomerId: string;
      
      if (customer && customer.phone) {
        // Search for existing customer by phone
        const existingCustomer = await Customer.findOne({
          where: { phone: customer.phone, isActive: true },
          transaction,
        });

        if (existingCustomer) {
          // Use existing customer
          finalCustomerId = existingCustomer.id;
        } else {
          // Create new customer
          const newCustomer = await Customer.create(
            {
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              address: customer.address,
              taxNumber: customer.taxNumber,
              creditLimit: customer.creditLimit || 0,
              currentBalance: 0,
              isActive: true,
              notes: customer.notes,
            },
            { transaction },
          );
          finalCustomerId = newCustomer.id;
        }
      } else {
        // No customer provided, use walk-in customer
        const walkInCustomer = await Customer.findOne({
          where: { name: 'Walk-in Customer' },
          transaction,
        });

        if (!walkInCustomer) {
          const customer = await Customer.create(
            {
              name: 'Walk-in Customer',
              isActive: true,
            },
            { transaction },
          );
          finalCustomerId = customer.id;
        } else {
          finalCustomerId = walkInCustomer.id;
        }
      }

      // Validate items array
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new AppError('Sale must have at least one item', 400);
      }

      // Calculate totals and validate stock
      let totalAmount = 0;
      let taxAmount = 0;
      let discountAmount = 0;

      // Create sale items and validate stock
      const saleItems = await Promise.all(
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

          // Validate item exists and is active
          const itemRecord = await Item.findOne({
            where: { id: itemId, isActive: true },
            transaction,
          });

          if (!itemRecord) {
            throw new AppError(`Item with ID ${itemId} not found or inactive`, 404);
          }

          // If variant specified, validate it
          if (itemVariantId) {
            const variant = await ItemVariant.findOne({
              where: { id: itemVariantId, itemId, isActive: true },
              transaction,
            });

            if (!variant) {
              throw new AppError(
                `Item variant with ID ${itemVariantId} not found or inactive`,
                404,
              );
            }

            // Check stock for variant
            // if (variant.stockQuantity < quantity) {
            //   throw new AppError(
            //     `Insufficient stock for item variant ${variant.code}. Available: ${variant.stockQuantity}, Requested: ${quantity}`,
            //     400,
            //   );
            // }
          } else {
            // For items without variants, we need to check if there are any variants with stock
            const variants = await ItemVariant.findAll({
              where: { itemId, isActive: true },
              transaction,
            });

            if (variants.length > 0) {
              throw new AppError(
                `Item ${itemRecord.code} has variants. Please specify a variant ID.`,
                400,
              );
            }
          }

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
          };
        }),
      );

      const finalAmount = totalAmount - discountAmount + taxAmount;

      if (!req.auth?.user?.id) {
        throw new AppError('Unauthorized', 401);
      }
      // Create sale
      const sale = await Sale.create(
        {
          clerkUserId: req.auth.user.id, // Assuming user info is attached to request by auth middleware
          customerId: finalCustomerId,
          status: SaleStatus.COMPLETED, // Assuming immediate completion for POS sales
          totalAmount,
          taxAmount,
          discountAmount,
          finalAmount,
          paymentMethod,
          paymentStatus,
          notes,
        },
        { transaction },
      );

      // Create sale items and update stock
      await Promise.all(
        saleItems.map(async (item) => {
          // Create sale item
          await SaleItem.create(
            {
              ...item,
              saleId: sale.id,
            },
            { transaction },
          );

          // Get current stock quantity
          let currentStock = 0;
          if (item.itemVariantId) {
            const variant = await ItemVariant.findByPk(item.itemVariantId, { transaction });
            if (!variant) {
              throw new AppError(`Item variant not found`, 404);
            }
            currentStock = variant.stockQuantity;
          }

          if (!req.auth?.user?.id) {
            throw new AppError('Unauthorized', 401);
          }

          // Create item movement record
          await ItemMovement.create(
            {
              clerkUserId: req.auth.user.id,
              itemId: item.itemId,
              itemVariantId: item.itemVariantId,
              movementType: MovementType.SALE,
              status: MovementStatus.COMPLETED,
              quantity: -item.quantity, // Negative for sales
              previousQuantity: currentStock,
              newQuantity: currentStock - item.quantity,
              referenceType: 'SALE',
              referenceId: sale.id,
              notes: `Sale #${sale.id}`,
            },
            { transaction },
          );

          // Update stock
          if (item.itemVariantId) {
            await ItemVariant.update(
              { stockQuantity: currentStock - item.quantity },
              {
                where: { id: item.itemVariantId },
                transaction,
              },
            );
          }
        }),
      );

      // Update customer balance if payment status is pending
      if (paymentStatus === 'PENDING') {
        await Customer.increment('currentBalance', {
          by: finalAmount,
          where: { id: finalCustomerId },
          transaction,
        });
      }

      // Commit transaction
      await transaction.commit();

      // Fetch the complete sale with items
      const completeSale = await Sale.findByPk(sale.id, {
        include: [
          {
            model: SaleItem,
            as: 'items',
            include: [
              { model: Item, as: 'item' },
              { model: ItemVariant, as: 'itemVariant' },
            ],
          },
          { model: Customer, as: 'customer' },
        ],
      });

      res.status(201).json({
        status: 'success',
        data: {
          sale: completeSale,
        },
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      next(error);
    }
  };
}
