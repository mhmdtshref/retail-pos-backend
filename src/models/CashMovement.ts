import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum CashMovementType {
  SALE = 'SALE',           // Cash received from sale
  RETURN = 'RETURN',       // Cash returned to customer
  WITHDRAWAL = 'WITHDRAWAL', // Cash taken out of register
  DEPOSIT = 'DEPOSIT',     // Cash added to register
  OPENING = 'OPENING',     // Opening balance
  CLOSING = 'CLOSING',     // Closing balance
  ADJUSTMENT = 'ADJUSTMENT', // Manual adjustment
}

export enum CashMovementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CashMovementAttributes {
  id: string;
  cashRegisterId: string;
  clerkUserId: string;
  movementType: CashMovementType;
  status: CashMovementStatus;
  amount: number;
  previousBalance: number;
  newBalance: number;
  referenceType?: string; // 'SALE', 'RETURN', etc.
  referenceId?: string;   // ID of related record (sale ID, etc.)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CashMovementCreationAttributes = Optional<
  CashMovementAttributes,
  'id' | 'status' | 'previousBalance' | 'newBalance' | 'createdAt' | 'updatedAt'
>;

class CashMovement extends Model<CashMovementAttributes, CashMovementCreationAttributes> implements CashMovementAttributes {
  public id!: string;
  public cashRegisterId!: string;
  public clerkUserId!: string;
  public movementType!: CashMovementType;
  public status!: CashMovementStatus;
  public amount!: number;
  public previousBalance!: number;
  public newBalance!: number;
  public referenceType?: string;
  public referenceId?: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CashMovement.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cashRegisterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cash_registers',
      key: 'id',
    },
  },
  clerkUserId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  movementType: {
    type: DataTypes.ENUM(...Object.values(CashMovementType)),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(CashMovementStatus)),
    allowNull: false,
    defaultValue: CashMovementStatus.COMPLETED,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  previousBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  newBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  referenceType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referenceId: {
    type: DataTypes.STRING,
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
}, {
  sequelize,
  tableName: 'cash_movements',
  timestamps: true,
});

export default CashMovement; 