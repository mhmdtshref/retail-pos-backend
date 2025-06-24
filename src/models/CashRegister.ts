import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import CashMovement from './CashMovement';

export enum CashRegisterStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface CashRegisterAttributes {
  id: string;
  clerkUserId: string;
  status: CashRegisterStatus;
  openingAmount: number;
  closingAmount: number;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  openingNotes?: string;
  closingNotes?: string;
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CashRegisterCreationAttributes = Optional<
  CashRegisterAttributes,
  'id' | 'status' | 'closingAmount' | 'expectedAmount' | 'actualAmount' | 'difference' | 'closingNotes' | 'closedAt' | 'createdAt' | 'updatedAt'
>;

class CashRegister extends Model<CashRegisterAttributes, CashRegisterCreationAttributes> implements CashRegisterAttributes {
  public id!: string;
  public clerkUserId!: string;
  public status!: CashRegisterStatus;
  public openingAmount!: number;
  public closingAmount!: number;
  public expectedAmount!: number;
  public actualAmount!: number;
  public difference!: number;
  public openingNotes?: string;
  public closingNotes?: string;
  public openedAt!: Date;
  public closedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly movements?: CashMovement[];
}

CashRegister.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clerkUserId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(CashRegisterStatus)),
    allowNull: false,
    defaultValue: CashRegisterStatus.OPEN,
  },
  openingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  closingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  expectedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  actualAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  difference: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  openingNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  closingNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  openedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  closedAt: {
    type: DataTypes.DATE,
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
}, {
  sequelize,
  tableName: 'cash_registers',
  timestamps: true,
});

export default CashRegister; 