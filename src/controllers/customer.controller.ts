import { Request, Response, NextFunction } from 'express';
import { ModelStatic, Op } from 'sequelize';
import Customer from '../models/Customer';
import { AppError } from '../utils/error';

export class CustomerController {
  private model: ModelStatic<Customer>;

  constructor() {
    this.model = Customer;
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.model.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          customer,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: customers } = await this.model.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        where: {
          isActive: true,
        },
      });

      res.status(200).json({
        status: 'success',
        data: {
          customers,
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

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.model.findByPk(req.params.id);
      
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: {
          customer,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || typeof query !== 'string') {
        throw new AppError('Search query is required', 400);
      }

      const customers = await this.model.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            {
              name: {
                [Op.iLike]: `%${query}%`,
              },
            },
            {
              phone: {
                [Op.iLike]: `%${query}%`,
              },
            },
          ],
        },
        limit,
        order: [['name', 'ASC']],
      });

      res.status(200).json({
        status: 'success',
        data: {
          customers,
        },
      });
    } catch (error) {
      next(error);
    }
  };
} 