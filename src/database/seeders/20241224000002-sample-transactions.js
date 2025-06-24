'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Get existing data for reference
      const customers = await queryInterface.sequelize.query(
        'SELECT id, name FROM customers WHERE name IN (:names)',
        {
          replacements: { names: ['John Doe', 'Jane Smith', 'Bob Johnson'] },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      const itemVariants = await queryInterface.sequelize.query(
        'SELECT id, code, selling_price, item_id FROM item_variants WHERE code IN (:codes)',
        {
          replacements: { 
            codes: [
              'LAPTOP001-8GB', 
              'PHONE001-128GB', 
              'TSHIRT001-M', 
              'JEANS001-32',
              'HAMMER001',
              'BALL001',
              'BOOK001'
            ] 
          },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      const items = await queryInterface.sequelize.query(
        'SELECT id, code FROM items WHERE code IN (:codes)',
        {
          replacements: { codes: ['HAMMER001', 'BALL001', 'BOOK001'] },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      // Create sample sales
      const sales = [
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          customer_id: customers.find(c => c.name === 'John Doe').id,
          status: 'COMPLETED',
          total_amount: 799.99,
          tax_amount: 40.00,
          discount_amount: 0.00,
          final_amount: 839.99,
          payment_method: 'CASH',
          payment_status: 'PAID',
          notes: 'Sample sale - Laptop purchase',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          customer_id: customers.find(c => c.name === 'Jane Smith').id,
          status: 'COMPLETED',
          total_amount: 899.99,
          tax_amount: 45.00,
          discount_amount: 50.00,
          final_amount: 894.99,
          payment_method: 'CASH',
          payment_status: 'PAID',
          notes: 'Sample sale - iPhone with discount',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          customer_id: customers.find(c => c.name === 'Bob Johnson').id,
          status: 'COMPLETED',
          total_amount: 69.98,
          tax_amount: 3.50,
          discount_amount: 0.00,
          final_amount: 73.48,
          payment_method: 'CASH',
          payment_status: 'PAID',
          notes: 'Sample sale - Clothing items',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          customer_id: customers.find(c => c.name === 'John Doe').id,
          status: 'COMPLETED',
          total_amount: 44.98,
          tax_amount: 2.25,
          discount_amount: 5.00,
          final_amount: 42.23,
          payment_method: 'CASH',
          payment_status: 'PAID',
          notes: 'Sample sale - Tools and sports',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      await queryInterface.bulkInsert('sales', sales, { transaction });

      // Create sale items
      const saleItems = [
        // Sale 1 - Laptop
        {
          id: uuidv4(),
          sale_id: sales[0].id,
          item_id: itemVariants.find(iv => iv.code === 'LAPTOP001-8GB').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'LAPTOP001-8GB').id,
          quantity: 1,
          unit_price: 799.99,
          discount_amount: 0.00,
          tax_amount: 40.00,
          subtotal: 799.99,
          total: 839.99,
          notes: null,
          created_at: sales[0].created_at,
          updated_at: sales[0].updated_at,
        },
        // Sale 2 - iPhone
        {
          id: uuidv4(),
          sale_id: sales[1].id,
          item_id: itemVariants.find(iv => iv.code === 'PHONE001-128GB').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'PHONE001-128GB').id,
          quantity: 1,
          unit_price: 899.99,
          discount_amount: 50.00,
          tax_amount: 45.00,
          subtotal: 899.99,
          total: 894.99,
          notes: null,
          created_at: sales[1].created_at,
          updated_at: sales[1].updated_at,
        },
        // Sale 3 - Clothing
        {
          id: uuidv4(),
          sale_id: sales[2].id,
          item_id: itemVariants.find(iv => iv.code === 'TSHIRT001-M').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'TSHIRT001-M').id,
          quantity: 2,
          unit_price: 19.99,
          discount_amount: 0.00,
          tax_amount: 2.00,
          subtotal: 39.98,
          total: 41.98,
          notes: null,
          created_at: sales[2].created_at,
          updated_at: sales[2].updated_at,
        },
        {
          id: uuidv4(),
          sale_id: sales[2].id,
          item_id: itemVariants.find(iv => iv.code === 'JEANS001-32').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'JEANS001-32').id,
          quantity: 1,
          unit_price: 49.99,
          discount_amount: 0.00,
          tax_amount: 1.50,
          subtotal: 49.99,
          total: 51.49,
          notes: null,
          created_at: sales[2].created_at,
          updated_at: sales[2].updated_at,
        },
        // Sale 4 - Tools and Sports
        {
          id: uuidv4(),
          sale_id: sales[3].id,
          item_id: items.find(i => i.code === 'HAMMER001').id,
          item_variant_id: null,
          quantity: 1,
          unit_price: 24.99,
          discount_amount: 2.50,
          tax_amount: 1.25,
          subtotal: 24.99,
          total: 23.74,
          notes: null,
          created_at: sales[3].created_at,
          updated_at: sales[3].updated_at,
        },
        {
          id: uuidv4(),
          sale_id: sales[3].id,
          item_id: items.find(i => i.code === 'BALL001').id,
          item_variant_id: null,
          quantity: 1,
          unit_price: 29.99,
          discount_amount: 2.50,
          tax_amount: 1.00,
          subtotal: 29.99,
          total: 28.49,
          notes: null,
          created_at: sales[3].created_at,
          updated_at: sales[3].updated_at,
        },
      ];

      await queryInterface.bulkInsert('sale_items', saleItems, { transaction });

      // Create sample purchase orders
      const purchaseOrders = [
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          order_number: 'PO-2024-001',
          status: 'RECEIVED',
          order_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          actual_delivery_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          total_amount: 1200.00,
          tax_amount: 60.00,
          discount_amount: 0.00,
          final_amount: 1260.00,
          notes: 'Electronics restock order',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          order_number: 'PO-2024-002',
          status: 'ORDERED',
          order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          expected_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          actual_delivery_date: null,
          total_amount: 500.00,
          tax_amount: 25.00,
          discount_amount: 0.00,
          final_amount: 525.00,
          notes: 'Clothing inventory order',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ];

      await queryInterface.bulkInsert('purchase_orders', purchaseOrders, { transaction });

      // Create purchase order items
      const purchaseOrderItems = [
        // PO 1 - Electronics
        {
          id: uuidv4(),
          purchase_order_id: purchaseOrders[0].id,
          item_id: itemVariants.find(iv => iv.code === 'LAPTOP001-8GB').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'LAPTOP001-8GB').id,
          quantity: 2,
          unit_price: 599.99,
          discount_amount: 0.00,
          tax_amount: 60.00,
          subtotal: 1199.98,
          total: 1259.98,
          received_quantity: 2,
          notes: null,
          created_at: purchaseOrders[0].created_at,
          updated_at: purchaseOrders[0].updated_at,
        },
        // PO 2 - Clothing
        {
          id: uuidv4(),
          purchase_order_id: purchaseOrders[1].id,
          item_id: itemVariants.find(iv => iv.code === 'TSHIRT001-M').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'TSHIRT001-M').id,
          quantity: 25,
          unit_price: 8.99,
          discount_amount: 0.00,
          tax_amount: 11.25,
          subtotal: 224.75,
          total: 236.00,
          received_quantity: 0,
          notes: null,
          created_at: purchaseOrders[1].created_at,
          updated_at: purchaseOrders[1].updated_at,
        },
        {
          id: uuidv4(),
          purchase_order_id: purchaseOrders[1].id,
          item_id: itemVariants.find(iv => iv.code === 'JEANS001-32').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'JEANS001-32').id,
          quantity: 10,
          unit_price: 25.99,
          discount_amount: 0.00,
          tax_amount: 13.00,
          subtotal: 259.90,
          total: 272.90,
          received_quantity: 0,
          notes: null,
          created_at: purchaseOrders[1].created_at,
          updated_at: purchaseOrders[1].updated_at,
        },
      ];

      await queryInterface.bulkInsert('purchase_order_items', purchaseOrderItems, { transaction });

      // Create item movements for sales
      const itemMovements = [
        // Laptop sale movement
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          item_id: itemVariants.find(iv => iv.code === 'LAPTOP001-8GB').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'LAPTOP001-8GB').id,
          movement_type: 'SALE',
          status: 'COMPLETED',
          quantity: -1,
          previous_quantity: 8,
          new_quantity: 7,
          reference_type: 'SALE',
          reference_id: sales[0].id,
          notes: `Sale #${sales[0].id}`,
          created_at: sales[0].created_at,
          updated_at: sales[0].updated_at,
        },
        // iPhone sale movement
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          item_id: itemVariants.find(iv => iv.code === 'PHONE001-128GB').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'PHONE001-128GB').id,
          movement_type: 'SALE',
          status: 'COMPLETED',
          quantity: -1,
          previous_quantity: 12,
          new_quantity: 11,
          reference_type: 'SALE',
          reference_id: sales[1].id,
          notes: `Sale #${sales[1].id}`,
          created_at: sales[1].created_at,
          updated_at: sales[1].updated_at,
        },
        // T-shirt sale movement
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          item_id: itemVariants.find(iv => iv.code === 'TSHIRT001-M').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'TSHIRT001-M').id,
          movement_type: 'SALE',
          status: 'COMPLETED',
          quantity: -2,
          previous_quantity: 30,
          new_quantity: 28,
          reference_type: 'SALE',
          reference_id: sales[2].id,
          notes: `Sale #${sales[2].id}`,
          created_at: sales[2].created_at,
          updated_at: sales[2].updated_at,
        },
        // Jeans sale movement
        {
          id: uuidv4(),
          clerk_user_id: 'demo-clerk-001',
          item_id: itemVariants.find(iv => iv.code === 'JEANS001-32').item_id,
          item_variant_id: itemVariants.find(iv => iv.code === 'JEANS001-32').id,
          movement_type: 'SALE',
          status: 'COMPLETED',
          quantity: -1,
          previous_quantity: 20,
          new_quantity: 19,
          reference_type: 'SALE',
          reference_id: sales[2].id,
          notes: `Sale #${sales[2].id}`,
          created_at: sales[2].created_at,
          updated_at: sales[2].updated_at,
        },
      ];

      await queryInterface.bulkInsert('item_movements', itemMovements, { transaction });

      // Update stock quantities based on sales
      await queryInterface.sequelize.query(
        `UPDATE item_variants SET stock_quantity = stock_quantity - 1 WHERE code = 'LAPTOP001-8GB'`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `UPDATE item_variants SET stock_quantity = stock_quantity - 1 WHERE code = 'PHONE001-128GB'`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `UPDATE item_variants SET stock_quantity = stock_quantity - 2 WHERE code = 'TSHIRT001-M'`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `UPDATE item_variants SET stock_quantity = stock_quantity - 1 WHERE code = 'JEANS001-32'`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete in reverse order to handle foreign key constraints
      await queryInterface.bulkDelete('item_movements', null, { transaction });
      await queryInterface.bulkDelete('sale_items', null, { transaction });
      await queryInterface.bulkDelete('sales', null, { transaction });
      await queryInterface.bulkDelete('purchase_order_items', null, { transaction });
      await queryInterface.bulkDelete('purchase_orders', null, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}; 