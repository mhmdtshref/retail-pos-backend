import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import PurchaseOrder from './PurchaseOrder';
import Item from './Item';
import ItemVariant from './ItemVariant';

interface PurchaseOrderItemAttributes {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  itemVariantId?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  receivedQuantity: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type PurchaseOrderItemCreationAttributes = Optional<
  PurchaseOrderItemAttributes,
  | 'id'
  | 'itemVariantId'
  | 'discountAmount'
  | 'taxAmount'
  | 'receivedQuantity'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
>;

class PurchaseOrderItem extends Model<PurchaseOrderItemAttributes, PurchaseOrderItemCreationAttributes> implements PurchaseOrderItemAttributes {
  public id!: string;
  public purchaseOrderId!: string;
  public itemId!: string;
  public itemVariantId!: string;
  public quantity!: number;
  public unitPrice!: number;
  public discountAmount!: number;
  public taxAmount!: number;
  public subtotal!: number;
  public total!: number;
  public receivedQuantity!: number;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly purchaseOrder?: PurchaseOrder;
  public readonly item?: Item;
  public readonly itemVariant?: ItemVariant;
}

PurchaseOrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    purchaseOrderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'purchase_orders',
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
    receivedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'PurchaseOrderItem',
    tableName: 'purchase_order_items',
    timestamps: true,
  },
);

export default PurchaseOrderItem;
