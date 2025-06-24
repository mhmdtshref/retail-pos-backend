import { Request, Response, NextFunction } from 'express';
import Sale, { SaleStatus } from '../models/Sale';
import SaleItem from '../models/SaleItem';
import Customer from '../models/Customer';
import Item from '../models/Item';
import ItemVariant from '../models/ItemVariant';
import ItemMovement, { MovementType, MovementStatus } from '../models/ItemMovement';
import CashRegister, { CashRegisterStatus } from '../models/CashRegister';
import CashMovement, { CashMovementType, CashMovementStatus } from '../models/CashMovement';
import sequelize from '../config/database';
import { AppError } from '../utils/error';
import { Op } from 'sequelize';

export class SaleController {
  // Get sales summary statistics
  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get date range from query parameters (optional)
      const { startDate, endDate } = req.query;
      
      let whereClause: any = {
        status: SaleStatus.COMPLETED, // Only count completed sales
      };

      // Add date range filter if provided
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt[Op.gte] = new Date(startDate as string);
        }
        if (endDate) {
          whereClause.createdAt[Op.lte] = new Date(endDate as string);
        }
      }

      // Get total sales amount
      const totalSalesResult = await Sale.findOne({
        where: whereClause,
        attributes: [
          [sequelize.fn('SUM', sequelize.col('final_amount')), 'totalSales'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        ],
        raw: true,
      }) as any;

      // Calculate values
      const totalSales = parseFloat(totalSalesResult?.totalSales || '0');
      const totalOrders = parseInt(totalSalesResult?.totalOrders || '0');
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      res.status(200).json({
        status: 'success',
        data: {
          totalSales,
          totalOrders,
          averageOrderValue,
        },
      });
    } catch (error) {
      next(error);
    }
  };

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

          const subtotal = Number(quantity) * Number(unitPrice);
          const total = subtotal - Number(itemDiscount) + Number(itemTax);

          totalAmount += subtotal;
          taxAmount += Number(itemTax);
          discountAmount += Number(itemDiscount);

          return {
            itemId,
            itemVariantId,
            quantity,
            unitPrice,
            discountAmount: Number(itemDiscount),
            taxAmount: Number(itemTax),
            subtotal,
            total,
            notes: itemNotes,
          };
        }),
      );

      const finalAmount = Number(totalAmount) - Number(discountAmount) + Number(taxAmount);

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

      // Handle cash register integration for cash payments
      if (paymentMethod === 'CASH' && paymentStatus === 'PAID') {
        // Find open cash register for this user
        const cashRegister = await CashRegister.findOne({
          where: {
            clerkUserId: req.auth.user.id,
            status: CashRegisterStatus.OPEN,
          },
          transaction,
        });

        if (cashRegister) {
          // Get current balance
          const movements = await CashMovement.findAll({
            where: {
              cashRegisterId: cashRegister.id,
              status: CashMovementStatus.COMPLETED,
            },
            transaction,
          });

          let currentBalance = Number(cashRegister.openingAmount) || 0;
          movements.forEach((movement) => {
            const amount = Number(movement.amount) || 0;
            if (movement.movementType === CashMovementType.SALE || 
                movement.movementType === CashMovementType.DEPOSIT) {
              currentBalance += amount;
            } else if (movement.movementType === CashMovementType.RETURN || 
                       movement.movementType === CashMovementType.WITHDRAWAL) {
              currentBalance -= amount;
            }
          });

          // Ensure finalAmount is a proper number
          const cashAmount = parseFloat(finalAmount.toString());
          if (isNaN(cashAmount)) {
            throw new AppError('Invalid sale amount for cash movement', 400);
          }

          const newBalance = currentBalance + cashAmount;

          // Debug logging
          console.log('Cash Movement Debug:', {
            finalAmount,
            cashAmount,
            currentBalance,
            newBalance,
            cashRegisterId: cashRegister.id,
            clerkUserId: req.auth.user.id
          });

          // Create cash sale movement
          await CashMovement.create(
            {
              cashRegisterId: cashRegister.id,
              clerkUserId: req.auth.user.id,
              movementType: CashMovementType.SALE,
              status: CashMovementStatus.COMPLETED,
              amount: parseFloat(cashAmount.toFixed(2)),
              previousBalance: parseFloat(currentBalance.toFixed(2)),
              newBalance: parseFloat(newBalance.toFixed(2)),
              referenceType: 'SALE',
              referenceId: sale.id,
              notes: `Cash sale #${sale.id}`,
            },
            { transaction },
          );
        }
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
