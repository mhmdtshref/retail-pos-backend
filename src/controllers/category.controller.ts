import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import { AppError } from '../utils/error';
import { Op } from 'sequelize';
import Item from '../models/Item';

export class CategoryController {
  // Create a new category
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, code, description, parentId } = req.body;

      // Validate required fields
      if (!name || !code) {
        throw new AppError('Name and code are required', 400);
      }

      // Check if category with same code already exists
      const existingCategory = await Category.findOne({
        where: { code },
      });

      if (existingCategory) {
        throw new AppError('Category with this code already exists', 400);
      }

      // Validate parent category if provided
      if (parentId) {
        const parentCategory = await Category.findOne({
          where: { id: parentId, isActive: true },
        });

        if (!parentCategory) {
          throw new AppError('Parent category not found or inactive', 404);
        }
      }

      const category = await Category.create({
        name,
        code,
        description,
        parentId,
        isActive: true,
      });

      // Fetch the complete category with parent information
      const completeCategory = await Category.findByPk(category.id, {
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name', 'code'],
          },
        ],
      });

      res.status(201).json({
        status: 'success',
        data: {
          category: completeCategory,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all categories
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, isActive, includeInactive } = req.query;

      const where: any = {};

      // Add search condition if provided
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Filter by active status if provided
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const categories = await Category.findAll({
        where,
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name', 'code'],
          },
          {
            model: Category,
            as: 'children',
            attributes: ['id', 'name', 'code'],
            where: includeInactive === 'true' ? {} : { isActive: true },
            required: false,
          },
        ],
        order: [['name', 'ASC']],
      });

      res.json({
        status: 'success',
        data: {
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get a single category by ID
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await Category.findByPk(req.params.id, {
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name', 'code'],
          },
          {
            model: Category,
            as: 'children',
            attributes: ['id', 'name', 'code'],
            where: { isActive: true },
            required: false,
          },
          {
            model: Item,
            as: 'items',
            attributes: ['id', 'name', 'code'],
            where: { isActive: true },
            required: false,
          },
        ],
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      res.json({
        status: 'success',
        data: {
          category,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Update a category
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, code, description, parentId, isActive } = req.body;

      const category = await Category.findByPk(req.params.id);

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check if code is being changed and if it conflicts with existing category
      if (code && code !== category.code) {
        const existingCategory = await Category.findOne({
          where: {
            [Op.and]: [
              { id: { [Op.ne]: category.id } },
              { code },
            ],
          },
        });

        if (existingCategory) {
          throw new AppError('Category with this code already exists', 400);
        }
      }

      // Validate parent category if provided
      if (parentId && parentId !== category.parentId) {
        // Prevent circular reference
        if (parentId === category.id) {
          throw new AppError('Category cannot be its own parent', 400);
        }

        const parentCategory = await Category.findOne({
          where: { id: parentId, isActive: true },
        });

        if (!parentCategory) {
          throw new AppError('Parent category not found or inactive', 404);
        }

        // Check if the new parent is not a descendant of this category
        let currentParent = await Category.findByPk(parentId);
        while (currentParent?.parentId) {
          if (currentParent.parentId === category.id) {
            throw new AppError('Cannot set a descendant category as parent', 400);
          }
          currentParent = await Category.findByPk(currentParent.parentId);
        }
      }

      await category.update({
        name: name || category.name,
        code: code || category.code,
        description: description !== undefined ? description : category.description,
        parentId: parentId !== undefined ? parentId : category.parentId,
        isActive: isActive !== undefined ? isActive : category.isActive,
      });

      // Fetch the updated category with parent information
      const updatedCategory = await Category.findByPk(category.id, {
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['id', 'name', 'code'],
          },
        ],
      });

      res.json({
        status: 'success',
        data: {
          category: updatedCategory,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete a category (soft delete by setting isActive to false)
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check if category has any active items
      const activeItems = await Item.count({
        where: {
          categoryId: category.id,
          isActive: true,
        },
      });

      if (activeItems > 0) {
        throw new AppError('Cannot delete category with active items', 400);
      }

      // Check if category has any active child categories
      const activeChildren = await Category.count({
        where: {
          parentId: category.id,
          isActive: true,
        },
      });

      if (activeChildren > 0) {
        throw new AppError('Cannot delete category with active child categories', 400);
      }

      await category.update({ isActive: false });

      res.json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
} 