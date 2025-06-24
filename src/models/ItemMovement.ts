import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Item from './Item';
import ItemVariant from './ItemVariant';
import Sale from './Sale';
import PurchaseOrder from './PurchaseOrder';

export enum MovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  TRANSFER = 'TRANSFER',
}

export enum MovementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ItemMovementAttributes {
  id: string;
  clerkUserId: string;
  itemId: string;
  itemVariantId?: string;
  movementType: MovementType;
  status: MovementStatus;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType?: 'SALE' | 'PURCHASE_ORDER';
  referenceId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ItemMovementCreationAttributes = Optional<
  ItemMovementAttributes,
  'id' | 'itemVariantId' | 'referenceType' | 'referenceId' | 'notes' | 'createdAt' | 'updatedAt'
>;

class ItemMovement
  extends Model<ItemMovementAttributes, ItemMovementCreationAttributes>
  implements ItemMovementAttributes
{
  public id!: string;
  public clerkUserId!: string;
  public itemId!: string;
  public itemVariantId?: string;
  public movementType!: MovementType;
  public status!: MovementStatus;
  public quantity!: number;
  public previousQuantity!: number;
  public newQuantity!: number;
  public referenceType?: 'SALE' | 'PURCHASE_ORDER';
  public referenceId?: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly item?: Item;
  public readonly itemVariant?: ItemVariant;
  public readonly sale?: Sale;
  public readonly purchaseOrder?: PurchaseOrder;
}

ItemMovement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clerkUserId: {
      type: DataTypes.STRING,
      allowNull: false,
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
    movementType: {
      type: DataTypes.ENUM(...Object.values(MovementType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MovementStatus)),
      allowNull: false,
      defaultValue: MovementStatus.PENDING,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notZero: (value: number) => value !== 0,
      },
    },
    previousQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    newQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referenceType: {
      type: DataTypes.ENUM('SALE', 'PURCHASE_ORDER'),
      allowNull: true,
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'item_movements',
    timestamps: true,
    indexes: [
      {
        fields: ['item_id', 'item_variant_id', 'created_at'],
      },
      {
        fields: ['reference_type', 'reference_id'],
      },
    ],
  },
);

export default ItemMovement;
