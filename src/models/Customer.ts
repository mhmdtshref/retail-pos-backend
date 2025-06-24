import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CustomerAttributes {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  creditLimit: number;
  currentBalance: number;
  isActive: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CustomerCreationAttributes = Optional<
  CustomerAttributes,
  | 'id'
  | 'email'
  | 'phone'
  | 'address'
  | 'taxNumber'
  | 'creditLimit'
  | 'currentBalance'
  | 'isActive'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
>;

class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public phone!: string;
  public address!: string;
  public taxNumber!: string;
  public creditLimit!: number;
  public currentBalance!: number;
  public isActive!: boolean;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Customer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taxNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creditLimit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    currentBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'customers',
  },
);

export default Customer;
