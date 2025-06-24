import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Item from './Item';

interface ItemVariantAttributes {
  id: string;
  itemId: string;
  code: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  isActive: boolean;
  attributes: Record<string, any>; // For storing variant attributes like size, color, etc.
  imageUrl?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ItemVariantCreationAttributes = Optional<
  ItemVariantAttributes,
  | 'id'
  | 'minStockLevel'
  | 'maxStockLevel'
  | 'isActive'
  | 'imageUrl'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
>;

class ItemVariant
  extends Model<ItemVariantAttributes, ItemVariantCreationAttributes>
  implements ItemVariantAttributes
{
  public id!: string;
  public itemId!: string;
  public code!: string;
  public purchasePrice!: number;
  public sellingPrice!: number;
  public stockQuantity!: number;
  public minStockLevel!: number;
  public maxStockLevel!: number;
  public isActive!: boolean;
  public attributes!: Record<string, any>;
  public imageUrl!: string;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly item?: Item;
}

ItemVariant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id',
      },
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    minStockLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    maxStockLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    attributes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'item_variants',
  },
);

export default ItemVariant;
