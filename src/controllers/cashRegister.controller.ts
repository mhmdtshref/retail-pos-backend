import { Request, Response, NextFunction } from 'express';
import CashRegister, { CashRegisterStatus } from '../models/CashRegister';
import CashMovement, { CashMovementType, CashMovementStatus } from '../models/CashMovement';
import sequelize from '../config/database';
import { AppError } from '../utils/error';

export class CashRegisterController {
  // Open cash register
  open = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { openingAmount, notes } = req.body;

      if (!req.auth?.user?.id) {
        throw new AppError('Unauthorized', 401);
      }

      // Check if there's already an open register for this user
      const existingOpenRegister = await CashRegister.findOne({
        where: {
          clerkUserId: req.auth.user.id,
          status: CashRegisterStatus.OPEN,
        },
        transaction,
      });

      if (existingOpenRegister) {
        throw new AppError('Cash register is already open', 400);
      }

      // Create new cash register session
      const cashRegister = await CashRegister.create(
        {
          clerkUserId: req.auth.user.id,
          status: CashRegisterStatus.OPEN,
          openingAmount: openingAmount || 0,
          openingNotes: notes,
          openedAt: new Date(),
        },
        { transaction },
      );

      // Create opening movement
      await CashMovement.create(
        {
          cashRegisterId: cashRegister.id,
          clerkUserId: req.auth.user.id,
          movementType: CashMovementType.OPENING,
          status: CashMovementStatus.COMPLETED,
          amount: parseFloat((openingAmount || 0).toString()),
          previousBalance: 0,
          newBalance: parseFloat((openingAmount || 0).toString()),
          notes: 'Opening balance',
        },
        { transaction },
      );

      await transaction.commit();

      res.status(201).json({
        status: 'success',
        data: {
          cashRegister,
        },
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };

  // Close cash register
  close = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { actualAmount, notes } = req.body;

      if (!req.auth?.user?.id) {
        throw new AppError('Unauthorized', 401);
      }

      // Find open register for this user
      const cashRegister = await CashRegister.findOne({
        where: {
          clerkUserId: req.auth.user.id,
          status: CashRegisterStatus.OPEN,
        },
        transaction,
      });

      if (!cashRegister) {
        throw new AppError('No open cash register found', 404);
      }

      // Calculate expected amount
      const movements = await CashMovement.findAll({
        where: {
          cashRegisterId: cashRegister.id,
          status: CashMovementStatus.COMPLETED,
        },
        transaction,
      });

      let expectedAmount = cashRegister.openingAmount;
      movements.forEach((movement) => {
        if (movement.movementType === CashMovementType.SALE || 
            movement.movementType === CashMovementType.DEPOSIT) {
          expectedAmount += movement.amount;
        } else if (movement.movementType === CashMovementType.RETURN || 
                   movement.movementType === CashMovementType.WITHDRAWAL) {
          expectedAmount -= movement.amount;
        }
      });

      const difference = (actualAmount || 0) - expectedAmount;

      // Update cash register
      await cashRegister.update(
        {
          status: CashRegisterStatus.CLOSED,
          closingAmount: actualAmount || 0,
          expectedAmount,
          actualAmount: actualAmount || 0,
          difference,
          closingNotes: notes,
          closedAt: new Date(),
        },
        { transaction },
      );

      // Create closing movement
      await CashMovement.create(
        {
          cashRegisterId: cashRegister.id,
          clerkUserId: req.auth.user.id,
          movementType: CashMovementType.CLOSING,
          status: CashMovementStatus.COMPLETED,
          amount: parseFloat((actualAmount || 0).toString()),
          previousBalance: parseFloat(expectedAmount.toString()),
          newBalance: 0,
          notes: 'Closing balance',
        },
        { transaction },
      );

      await transaction.commit();

      res.status(200).json({
        status: 'success',
        data: {
          cashRegister,
          reconciliation: {
            expectedAmount,
            actualAmount: actualAmount || 0,
            difference,
          },
        },
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };

  // Get current cash register status
  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.user?.id) {
        throw new AppError('Unauthorized', 401);
      }

      const cashRegister = await CashRegister.findOne({
        where: {
          clerkUserId: req.auth.user.id,
          status: CashRegisterStatus.OPEN,
        },
        include: [
          {
            model: CashMovement,
            as: 'movements',
            where: { status: CashMovementStatus.COMPLETED },
            required: false,
          },
        ],
      });

      if (!cashRegister) {
        return res.status(200).json({
          status: 'success',
          data: {
            isOpen: false,
            cashRegister: null,
          },
        });
      }

      // Calculate current balance
      let currentBalance = parseFloat(cashRegister.openingAmount.toString());
      cashRegister.movements?.forEach((movement) => {
        if (movement.movementType === CashMovementType.SALE || 
            movement.movementType === CashMovementType.DEPOSIT) {
            console.log('typeof movement.amount', typeof movement.amount);
            console.log('typeof currentBalance', typeof currentBalance);
          currentBalance += parseFloat(movement.amount.toString());
        } else if (movement.movementType === CashMovementType.RETURN || 
                   movement.movementType === CashMovementType.WITHDRAWAL) {
          currentBalance -= parseFloat(movement.amount.toString());
        }
      });

      return res.status(200).json({
        status: 'success',
        data: {
          isOpen: true,
          cashRegister,
          currentBalance,
        },
      });
    } catch (error) {
      next(error);
      return;
    }
  };

  // Add money to register (deposit)
  deposit = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { amount, notes } = req.body;

      if (!req.auth?.user?.id) {
        throw new AppError('Unauthorized', 401);
      }

      if (!amount || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }

      // Find open register
      const cashRegister = await CashRegister.findOne({
        where: {
          clerkUserId: req.auth.user.id,
          status: CashRegisterStatus.OPEN,
        },
        transaction,
      });

      if (!cashRegister) {
        throw new AppError('No open cash register found', 404);
      }

      // Get current balance
      const movements = await CashMovement.findAll({
        where: {
          cashRegisterId: cashRegister.id,
          status: CashMovementStatus.COMPLETED,
        },
        transaction,
      });

      let currentBalance = cashRegister.openingAmount;
      movements.forEach((movement) => {
        if (movement.movementType === CashMovementType.SALE || 
            movement.movementType === CashMovementType.DEPOSIT) {
          currentBalance += movement.amount;
        } else if (movement.movementType === CashMovementType.RETURN || 
                   movement.movementType === CashMovementType.WITHDRAWAL) {
          currentBalance -= movement.amount;
        }
      });

      // Create deposit movement
      await CashMovement.create(
        {
          cashRegisterId: cashRegister.id,
          clerkUserId: req.auth.user.id,
          movementType: CashMovementType.DEPOSIT,
          status: CashMovementStatus.COMPLETED,
          amount: parseFloat(amount.toString()),
          previousBalance: parseFloat(currentBalance.toString()),
          newBalance: parseFloat((currentBalance + amount).toString()),
          notes,
        },
        { transaction },
      );

      await transaction.commit();

      res.status(201).json({
        status: 'success',
        data: {
          message: 'Deposit successful',
          newBalance: currentBalance + amount,
        },
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };

  // Remove money from register (withdrawal)
  withdraw = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { amount, notes } = req.body;

      if (!req.auth?.user?.id) {
        throw new AppError('Unauthorized', 401);
      }

      if (!amount || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }

      // Find open register
      const cashRegister = await CashRegister.findOne({
        where: {
          clerkUserId: req.auth.user.id,
          status: CashRegisterStatus.OPEN,
        },
        transaction,
      });

      if (!cashRegister) {
        throw new AppError('No open cash register found', 404);
      }

      // Get current balance
      const movements = await CashMovement.findAll({
        where: {
          cashRegisterId: cashRegister.id,
          status: CashMovementStatus.COMPLETED,
        },
        transaction,
      });

      let currentBalance = cashRegister.openingAmount;
      movements.forEach((movement) => {
        if (movement.movementType === CashMovementType.SALE || 
            movement.movementType === CashMovementType.DEPOSIT) {
          currentBalance += movement.amount;
        } else if (movement.movementType === CashMovementType.RETURN || 
                   movement.movementType === CashMovementType.WITHDRAWAL) {
          currentBalance -= movement.amount;
        }
      });

      if (currentBalance < amount) {
        throw new AppError('Insufficient funds in register', 400);
      }

      // Create withdrawal movement
      await CashMovement.create(
        {
          cashRegisterId: cashRegister.id,
          clerkUserId: req.auth.user.id,
          movementType: CashMovementType.WITHDRAWAL,
          status: CashMovementStatus.COMPLETED,
          amount: parseFloat(amount.toString()),
          previousBalance: parseFloat(currentBalance.toString()),
          newBalance: parseFloat((currentBalance - amount).toString()),
          notes,
        },
        { transaction },
      );

      await transaction.commit();

      res.status(201).json({
        status: 'success',
        data: {
          message: 'Withdrawal successful',
          newBalance: currentBalance - amount,
        },
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };

  // Get cash register history
  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.user?.id) {
        throw new AppError('Unauthorized', 401);
      }

      const { page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows: cashRegisters } = await CashRegister.findAndCountAll({
        where: {
          clerkUserId: req.auth.user.id,
        },
        include: [
          {
            model: CashMovement,
            as: 'movements',
            where: { status: CashMovementStatus.COMPLETED },
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        status: 'success',
        data: {
          cashRegisters,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Record cash sale (called automatically when sale is made)
  recordCashSale = async (cashRegisterId: string, saleId: string, amount: number, clerkUserId: string) => {
    try {
      const cashRegister = await CashRegister.findByPk(cashRegisterId);
      if (!cashRegister || cashRegister.status !== CashRegisterStatus.OPEN) {
        throw new Error('Cash register not open');
      }

      // Get current balance
      const movements = await CashMovement.findAll({
        where: {
          cashRegisterId,
          status: CashMovementStatus.COMPLETED,
        },
      });

      let currentBalance = cashRegister.openingAmount;
      movements.forEach((movement) => {
        if (movement.movementType === CashMovementType.SALE || 
            movement.movementType === CashMovementType.DEPOSIT) {
          currentBalance += movement.amount;
        } else if (movement.movementType === CashMovementType.RETURN || 
                   movement.movementType === CashMovementType.WITHDRAWAL) {
          currentBalance -= movement.amount;
        }
      });

      // Create sale movement
      await CashMovement.create({
        cashRegisterId,
        clerkUserId,
        movementType: CashMovementType.SALE,
        status: CashMovementStatus.COMPLETED,
        amount: parseFloat(amount.toString()),
        previousBalance: parseFloat(currentBalance.toString()),
        newBalance: parseFloat((currentBalance + amount).toString()),
        referenceType: 'SALE',
        referenceId: saleId,
        notes: `Cash sale #${saleId}`,
      });
    } catch (error) {
      console.error('Error recording cash sale:', error);
      throw error;
    }
  };

  // Record cash return (called automatically when return is made)
  recordCashReturn = async (cashRegisterId: string, saleId: string, amount: number, clerkUserId: string) => {
    try {
      const cashRegister = await CashRegister.findByPk(cashRegisterId);
      if (!cashRegister || cashRegister.status !== CashRegisterStatus.OPEN) {
        throw new Error('Cash register not open');
      }

      // Get current balance
      const movements = await CashMovement.findAll({
        where: {
          cashRegisterId,
          status: CashMovementStatus.COMPLETED,
        },
      });

      let currentBalance = cashRegister.openingAmount;
      movements.forEach((movement) => {
        if (movement.movementType === CashMovementType.SALE || 
            movement.movementType === CashMovementType.DEPOSIT) {
          currentBalance += movement.amount;
        } else if (movement.movementType === CashMovementType.RETURN || 
                   movement.movementType === CashMovementType.WITHDRAWAL) {
          currentBalance -= movement.amount;
        }
      });

      if (currentBalance < amount) {
        throw new Error('Insufficient funds for return');
      }

      // Create return movement
      await CashMovement.create({
        cashRegisterId,
        clerkUserId,
        movementType: CashMovementType.RETURN,
        status: CashMovementStatus.COMPLETED,
        amount: parseFloat(amount.toString()),
        previousBalance: parseFloat(currentBalance.toString()),
        newBalance: parseFloat((currentBalance - amount).toString()),
        referenceType: 'SALE',
        referenceId: saleId,
        notes: `Cash return for sale #${saleId}`,
      });
    } catch (error) {
      console.error('Error recording cash return:', error);
      throw error;
    }
  };
} 