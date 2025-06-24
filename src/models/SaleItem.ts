import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Sale from './Sale';
import Item from './Item';
import ItemVariant from './ItemVariant';

interface SaleItemAttributes {
  id: string;
  saleId: string;
  itemId: string;
  itemVariantId?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type SaleItemCreationAttributes = Optional<
  SaleItemAttributes,
  'id' | 'itemVariantId' | 'discountAmount' | 'taxAmount' | 'notes' | 'createdAt' | 'updatedAt'
>;

class SaleItem
  extends Model<SaleItemAttributes, SaleItemCreationAttributes>
  implements SaleItemAttributes
{
  public id!: string;
  public saleId!: string;
  public itemId!: string;
  public itemVariantId!: string;
  public quantity!: number;
  public unitPrice!: number;
  public discountAmount!: number;
  public taxAmount!: number;
  public subtotal!: number;
  public total!: number;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly sale?: Sale;
  public readonly item?: Item;
  public readonly itemVariant?: ItemVariant;
}

SaleItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    saleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sales',
        key: 'id',
      },
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id',
      },
    },
    itemVariantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'item_variants',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'sale_items',
  },
);

export default SaleItem;
