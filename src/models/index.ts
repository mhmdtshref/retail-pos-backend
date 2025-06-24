import { defineAssociations } from './associations';
import PurchaseOrder from './PurchaseOrder';
import Item from './Item';
import ItemVariant from './ItemVariant';
import Category from './Category';
import Customer from './Customer';
import Sale from './Sale';
import SaleItem from './SaleItem';
import Expense from './Expense';
import ItemMovement from './ItemMovement';
import PurchaseOrderItem from './PurchaseOrderItem';
import CashRegister from './CashRegister';
import CashMovement from './CashMovement';

// Define associations after all models are initialized
defineAssociations();

// Export all models
export {
  PurchaseOrder,
  Item,
  ItemVariant,
  Category,
  Customer,
  Sale,
  SaleItem,
  Expense,
  ItemMovement,
  PurchaseOrderItem,
  CashRegister,
  CashMovement,
};

// Export associations
export * from './associations';

// Sync all models with database
export const syncDatabase = async (force = false) => {
  try {
    // Define the order of table creation based on dependencies
    const syncOrder = [
      Category,      // No dependencies
      Customer,      // No dependencies
      Item,          // Depends on Category
      ItemVariant,   // Depends on Item
      Sale,          // Depends on Customer
      SaleItem,      // Depends on Sale, Item, and ItemVariant
      PurchaseOrder, // No dependencies
      PurchaseOrderItem, // Depends on PurchaseOrder, Item, and ItemVariant
      ItemMovement,  // Depends on Item, ItemVariant, Sale, and PurchaseOrder
      Expense,       // No dependencies
      CashRegister,  // No dependencies
      CashMovement   // Depends on CashRegister
    ];

    // Sync tables in order
    for (const model of syncOrder) {
      await model.sync({ force });
    }

    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};
