import { Request, Response as ExpressResponse, NextFunction } from 'express';
import { Op } from 'sequelize';
import Item from '../models/Item';
import ItemVariant from '../models/ItemVariant';
import Category from '../models/Category';
import sequelize from '../config/database';
import { AppError } from '../utils/error';
import { CodeGeneratorService } from '../services/codeGenerator.service';
import { Store } from '../models/Item';

// Define custom request interface to include query parameters
interface SearchQueryParams extends Record<string, string | undefined> {
  query?: string;
  categoryId?: string;
  store?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  hasVariants?: string;
  limit?: string;
  offset?: string;
}

interface CustomRequest extends Omit<Request, 'query'> {
  query: SearchQueryParams;
}

// Define custom response type that includes status and json methods
interface CustomResponse extends ExpressResponse {
  status(code: number): this;
  json(body: any): this;
}

export class ItemController {
  // Create item with variants
  createWithVariants = async (req: Request, res: CustomResponse, next: NextFunction): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
      const {
        description,
        categoryId,
        store,
        purchasePrice,
        sellingPrice,
        minStockLevel,
        maxStockLevel,
        imageUrl,
        notes,
        variantGroups,
        variantDefaults,
      } = req.body;

      // Validate required fields
      if (!categoryId || !store) {
        throw new AppError('CategoryId and store are required', 400);
      }

      // Validate store value
      if (!Object.values(Store).includes(store)) {
        throw new AppError('Invalid store value', 400);
      }

      // Generate automatic code
      const code = await CodeGeneratorService.generateItemCode(store);

      // Validate category exists
      const category = await Category.findOne({
        where: { id: categoryId, isActive: true },
        transaction,
      });

      if (!category) {
        throw new AppError('Category not found or inactive', 404);
      }

      // Create item
      const item = await Item.create(
        {
          code,
          description,
          categoryId,
          store,
          purchasePrice,
          sellingPrice,
          minStockLevel,
          maxStockLevel,
          imageUrl,
          notes,
          isActive: true,
        },
        { transaction },
      );

      // Generate variants from variant groups if provided
      if (variantGroups && typeof variantGroups === 'object' && Object.keys(variantGroups).length > 0) {
        // Validate variant groups structure
        for (const [groupName, values] of Object.entries(variantGroups)) {
          if (!Array.isArray(values) || values.length === 0) {
            throw new AppError(`Variant group '${groupName}' must be a non-empty array`, 400);
          }
          // Validate that all values are strings
          if (!values.every(value => typeof value === 'string')) {
            throw new AppError(`All values in variant group '${groupName}' must be strings`, 400);
          }
        }

        // Generate all possible combinations
        const variantCombinations = CodeGeneratorService.generateVariantCombinations(variantGroups);
        
        if (variantCombinations.length === 0) {
          throw new AppError('No valid variant combinations could be generated', 400);
        }

        // Check if any generated variant codes already exist
        const generatedCodes = variantCombinations.map(combination => 
          CodeGeneratorService.generateVariantCode(code, combination)
        );

        const existingVariants = await ItemVariant.findAll({
          where: { code: { [Op.in]: generatedCodes } },
          transaction,
        });

        if (existingVariants.length > 0) {
          throw new AppError('One or more generated variant codes already exist', 400);
        }

        // Create variants with default values
        const variantDefaultsObj = variantDefaults || {};
        
        await Promise.all(
          variantCombinations.map((combination) => {
            const variantCode = CodeGeneratorService.generateVariantCode(code, combination);
            
            return ItemVariant.create(
              {
                itemId: item.id,
                code: variantCode,
                purchasePrice: variantDefaultsObj.purchasePrice || purchasePrice,
                sellingPrice: variantDefaultsObj.sellingPrice || sellingPrice,
                stockQuantity: variantDefaultsObj.stockQuantity || 0,
                minStockLevel: variantDefaultsObj.minStockLevel || minStockLevel || 0,
                maxStockLevel: variantDefaultsObj.maxStockLevel || maxStockLevel || 0,
                imageUrl: variantDefaultsObj.imageUrl,
                attributes: combination,
                notes: variantDefaultsObj.notes,
                isActive: true,
              },
              { transaction },
            );
          }),
        );
      }

      // Commit transaction
      await transaction.commit();

      // Fetch the complete item with variants
      const completeItem = await Item.findByPk(item.id, {
        include: [
          {
            model: ItemVariant,
            as: 'variants',
          },
          {
            model: Category,
            as: 'category',
            attributes: ['name'],
          },
        ],
      });

      res.status(201).json({
        status: 'success',
        data: {
          item: completeItem,
        },
      });
    } catch (error) {
      console.log(error);
      // Rollback transaction on error
      await transaction.rollback();
      next(error);
    }
  };

  // Search items with variants
  search = async (req: CustomRequest, res: CustomResponse, next: NextFunction): Promise<void> => {
    try {
      const {
        query,
        categoryId,
        store,
        minPrice,
        maxPrice,
        inStock,
        hasVariants,
        limit = '10',
        offset = '0',
      } = req.query;

      const where: any = {
        isActive: true,
      };

      // Add search conditions
      if (query) {
        where[Op.or] = [
          { code: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ];
      }

      // Filter by category
      if (categoryId) {
        where.categoryId = categoryId;
      }

      // Filter by store
      if (store) {
        where.store = store;
      }

      // Filter by price range
      if (minPrice || maxPrice) {
        where.sellingPrice = {};
        if (minPrice) {
          where.sellingPrice[Op.gte] = parseFloat(minPrice);
        }
        if (maxPrice) {
          where.sellingPrice[Op.lte] = parseFloat(maxPrice);
        }
      }

      // Get items with their variants
      const items = await Item.findAndCountAll({
        where,
        include: [
          {
            model: ItemVariant,
            as: 'variants',
            where: inStock === 'true' ? { stockQuantity: { [Op.gt]: 0 } } : undefined,
            required: hasVariants === 'true',
            include: [
              {
                model: Item,
                as: 'item',
                attributes: ['code', 'description', 'categoryId'],
                include: [
                  {
                    model: Category,
                    as: 'category',
                    attributes: ['name'],
                  },
                ],
              },
            ],
          },
          {
            model: Category,
            as: 'category',
            attributes: ['name'],
          },
        ],
        order: [['code', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Transform the response to include variant information in a more organized way
      const transformedItems = items.rows.map((item) => {
        const variants = item.variants || [];
        return {
          id: item.id,
          code: item.code,
          description: item.description,
          store: item.store,
          category: item.category,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          minStockLevel: item.minStockLevel,
          maxStockLevel: item.maxStockLevel,
          imageUrl: item.imageUrl,
          notes: item.notes,
          hasVariants: variants.length > 0,
          variants: variants.map((variant) => ({
            id: variant.id,
            code: variant.code,
            purchasePrice: variant.purchasePrice,
            sellingPrice: variant.sellingPrice,
            stockQuantity: variant.stockQuantity,
            minStockLevel: variant.minStockLevel,
            maxStockLevel: variant.maxStockLevel,
            imageUrl: variant.imageUrl,
            attributes: variant.attributes,
            notes: variant.notes,
          })),
        };
      });

      res.status(200).json({
        status: 'success',
        data: {
          items: transformedItems,
          pagination: {
            total: items.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            totalPages: Math.ceil(items.count / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
