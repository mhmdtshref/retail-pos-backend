import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Item from './Item';

interface CategoryAttributes {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  'id' | 'description' | 'parentId' | 'isActive' | 'createdAt' | 'updatedAt'
>;

class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: string;
  public name!: string;
  public code!: string;
  public description!: string;
  public parentId!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly items?: Item[];
  public readonly parent?: Category;
  public readonly children?: Category[];
}

Category.init(
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
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'categories',
  },
);

export default Category;
