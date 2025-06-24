import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';
import ItemVariant from './ItemVariant';

export enum Store {
  MINI_QUEEN = 'Mini Queen',
  LARICHE = 'Lariche',
}

interface ItemAttributes {
  id: string;
  code: string;
  description?: string;
  categoryId: string;
  store: Store;
  purchasePrice: number;
  sellingPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  isActive: boolean;
  imageUrl?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ItemCreationAttributes = Optional<
  ItemAttributes,
  | 'id'
  | 'code'
  | 'description'
  | 'minStockLevel'
  | 'maxStockLevel'
  | 'isActive'
  | 'imageUrl'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
>;

class Item extends Model<ItemAttributes, ItemCreationAttributes> implements ItemAttributes {
  public id!: string;
  public code!: string;
  public description!: string;
  public categoryId!: string;
  public store!: Store;
  public purchasePrice!: number;
  public sellingPrice!: number;
  public minStockLevel!: number;
  public maxStockLevel!: number;
  public isActive!: boolean;
  public imageUrl!: string;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly category?: Category;
  public readonly variants?: ItemVariant[];
}

Item.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    store: {
      type: DataTypes.ENUM(...Object.values(Store)),
      allowNull: false,
      defaultValue: Store.LARICHE,
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
    tableName: 'items',
  },
);

export default Item;
