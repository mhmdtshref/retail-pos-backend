import Customer from './Customer';
import Category from './Category';
import Item from './Item';
import ItemVariant from './ItemVariant';
import Sale from './Sale';
import SaleItem from './SaleItem';
import Expense from './Expense';
import PurchaseOrder from './PurchaseOrder';
import PurchaseOrderItem from './PurchaseOrderItem';
import ItemMovement from './ItemMovement';
import CashRegister from './CashRegister';
import CashMovement from './CashMovement';

// Define associations after all models are initialized
export function defineAssociations() {
  // Sale Associations
  Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
  Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' });
  Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });

  // SaleItem Associations
  SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
  SaleItem.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
  SaleItem.belongsTo(ItemVariant, { foreignKey: 'itemVariantId', as: 'itemVariant' });

  // Item Associations
  Item.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
  Item.hasMany(ItemVariant, { foreignKey: 'itemId', as: 'variants' });
  Item.hasMany(SaleItem, { foreignKey: 'itemId', as: 'saleItems' });
  Item.hasMany(PurchaseOrderItem, { foreignKey: 'itemId', as: 'purchaseOrderItems' });
  Item.hasMany(ItemMovement, { foreignKey: 'itemId', as: 'movements' });

  // Category Associations
  Category.hasMany(Item, { foreignKey: 'categoryId', as: 'items' });
  Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
  Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });

  // ItemVariant Associations
  ItemVariant.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
  ItemVariant.hasMany(SaleItem, { foreignKey: 'itemVariantId', as: 'saleItems' });
  ItemVariant.hasMany(PurchaseOrderItem, { foreignKey: 'itemVariantId', as: 'purchaseOrderItems' });
  ItemVariant.hasMany(ItemMovement, { foreignKey: 'itemVariantId', as: 'movements' });

  // PurchaseOrder Associations
  PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId', as: 'items' });

  // PurchaseOrderItem Associations
  PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });
  PurchaseOrderItem.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
  PurchaseOrderItem.belongsTo(ItemVariant, { foreignKey: 'itemVariantId', as: 'itemVariant' });

  // ItemMovement Associations
  ItemMovement.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
  ItemMovement.belongsTo(ItemVariant, { foreignKey: 'itemVariantId', as: 'itemVariant' });
  ItemMovement.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
  ItemMovement.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });

  // CashRegister Associations
  CashRegister.hasMany(CashMovement, { foreignKey: 'cashRegisterId', as: 'movements' });

  // CashMovement Associations
  CashMovement.belongsTo(CashRegister, { foreignKey: 'cashRegisterId', as: 'cashRegister' });
}

// Export all models
export {
  Customer,
  Category,
  Item,
  ItemVariant,
  Sale,
  SaleItem,
  Expense,
  PurchaseOrder,
  PurchaseOrderItem,
  ItemMovement,
  CashRegister,
  CashMovement,
};
