import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Order from './Order';
import Item from './Item';

interface OrderItemAttributes {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrderItemCreationAttributes = Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  public id!: string;
  public orderId!: string;
  public itemId!: string;
  public quantity!: number;
  public price!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly order?: Order;
  public readonly item?: Item;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName: 'order_items',
  },
);

export default OrderItem;
