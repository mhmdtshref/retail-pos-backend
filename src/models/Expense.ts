import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum ExpenseCategory {
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  SALARY = 'SALARY',
  MAINTENANCE = 'MAINTENANCE',
  SUPPLIES = 'SUPPLIES',
  MARKETING = 'MARKETING',
  INSURANCE = 'INSURANCE',
  TAXES = 'TAXES',
  OTHER = 'OTHER',
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

export interface ExpenseAttributes {
  id: string;
  clerkUserId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  status: ExpenseStatus;
  paymentDate?: Date;
  dueDate?: Date;
  paymentMethod?: string;
  referenceNumber?: string;
  attachments: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseCreationAttributes = Optional<
  ExpenseAttributes,
  | 'id'
  | 'status'
  | 'paymentDate'
  | 'dueDate'
  | 'paymentMethod'
  | 'referenceNumber'
  | 'attachments'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
>;

class Expense
  extends Model<ExpenseAttributes, ExpenseCreationAttributes>
  implements ExpenseAttributes
{
  public id!: string;
  public clerkUserId!: string;
  public category!: ExpenseCategory;
  public amount!: number;
  public description!: string;
  public status!: ExpenseStatus;
  public paymentDate?: Date;
  public dueDate?: Date;
  public paymentMethod?: string;
  public referenceNumber?: string;
  public attachments!: string[];
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Expense.init(
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
    category: {
      type: DataTypes.ENUM(...Object.values(ExpenseCategory)),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ExpenseStatus)),
      allowNull: false,
      defaultValue: ExpenseStatus.PENDING,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
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
    tableName: 'expenses',
    timestamps: true,
  },
);

export default Expense;
