import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Customer from './Customer';
import SaleItem from './SaleItem';

export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface SaleAttributes {
  id: string;
  clerkUserId: string;
  customerId: string;
  status: SaleStatus;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SaleCreationAttributes = Optional<
  SaleAttributes,
  'id' | 'status' | 'discountAmount' | 'taxAmount' | 'notes' | 'createdAt' | 'updatedAt'
>;

class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: string;
  public clerkUserId!: string;
  public customerId!: string;
  public status!: SaleStatus;
  public totalAmount!: number;
  public discountAmount!: number;
  public taxAmount!: number;
  public finalAmount!: number;
  public paymentMethod!: string;
  public paymentStatus!: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly customer?: Customer;
  public readonly items?: SaleItem[];
}

Sale.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clerkUserId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SaleStatus)),
      allowNull: false,
      defaultValue: SaleStatus.PENDING,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    finalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: 'sales',
    timestamps: true,
  },
);

export default Sale;
