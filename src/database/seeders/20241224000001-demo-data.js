'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create Categories
      const categories = [
        {
          id: uuidv4(),
          name: 'Electronics',
          code: 'ELECTRONICS',
          description: 'Electronic devices and accessories',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          name: 'Clothing',
          code: 'CLOTHING',
          description: 'Apparel and fashion items',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          name: 'Home & Garden',
          code: 'HOME_GARDEN',
          description: 'Home improvement and garden supplies',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          name: 'Sports & Outdoors',
          code: 'SPORTS_OUTDOORS',
          description: 'Sports equipment and outdoor gear',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          name: 'Books & Media',
          code: 'BOOKS_MEDIA',
          description: 'Books, movies, and media content',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('categories', categories, { transaction });

      // Get category IDs for reference
      const categoryIds = await queryInterface.sequelize.query(
        'SELECT id, name FROM categories WHERE name IN (:names)',
        {
          replacements: { names: categories.map(c => c.name) },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      const categoryMap = {};
      categoryIds.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });

      // Create Items
      const items = [
        {
          id: uuidv4(),
          code: 'LAPTOP001',
          description: '15.6" Full HD laptop with Intel i5 processor',
          category_id: categoryMap['Electronics'],
          store: 'Lariche',
          purchase_price: 599.99,
          selling_price: 799.99,
          min_stock_level: 5,
          max_stock_level: 50,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          code: 'PHONE001',
          description: '128GB iPhone 13 with A15 Bionic chip',
          category_id: categoryMap['Electronics'],
          store: 'Lariche',
          purchase_price: 699.99,
          selling_price: 899.99,
          min_stock_level: 10,
          max_stock_level: 100,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          code: 'TSHIRT001',
          description: '100% cotton comfortable t-shirt',
          category_id: categoryMap['Clothing'],
          store: 'Lariche',
          purchase_price: 8.99,
          selling_price: 19.99,
          min_stock_level: 50,
          max_stock_level: 200,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          code: 'JEANS001',
          description: 'Classic blue denim jeans',
          category_id: categoryMap['Clothing'],
          store: 'Lariche',
          purchase_price: 25.99,
          selling_price: 49.99,
          min_stock_level: 30,
          max_stock_level: 150,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          code: 'HAMMER001',
          description: '16oz claw hammer for general use',
          category_id: categoryMap['Home & Garden'],
          store: 'Lariche',
          purchase_price: 12.99,
          selling_price: 24.99,
          min_stock_level: 20,
          max_stock_level: 100,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          code: 'BALL001',
          description: 'Size 5 professional soccer ball',
          category_id: categoryMap['Sports & Outdoors'],
          store: 'Lariche',
          purchase_price: 15.99,
          selling_price: 29.99,
          min_stock_level: 25,
          max_stock_level: 120,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          code: 'BOOK001',
          description: 'Classic novel by F. Scott Fitzgerald',
          category_id: categoryMap['Books & Media'],
          store: 'Lariche',
          purchase_price: 9.99,
          selling_price: 14.99,
          min_stock_level: 15,
          max_stock_level: 80,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('items', items, { transaction });

      // Get item IDs for reference
      const itemIds = await queryInterface.sequelize.query(
        'SELECT id, code FROM items WHERE code IN (:codes)',
        {
          replacements: { codes: items.map(i => i.code) },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      const itemMap = {};
      itemIds.forEach(item => {
        itemMap[item.code] = item.id;
      });

      // Create Item Variants
      const itemVariants = [
        {
          id: uuidv4(),
          item_id: itemMap['LAPTOP001'],
          code: 'LAPTOP001-8GB',
          purchase_price: 599.99,
          selling_price: 799.99,
          stock_quantity: 8,
          min_stock_level: 2,
          max_stock_level: 20,
          is_active: true,
          attributes: JSON.stringify({ ram: '8GB', storage: '256GB SSD' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          item_id: itemMap['LAPTOP001'],
          code: 'LAPTOP001-16GB',
          purchase_price: 699.99,
          selling_price: 899.99,
          stock_quantity: 5,
          min_stock_level: 2,
          max_stock_level: 15,
          is_active: true,
          attributes: JSON.stringify({ ram: '16GB', storage: '512GB SSD' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          item_id: itemMap['PHONE001'],
          code: 'PHONE001-128GB',
          purchase_price: 699.99,
          selling_price: 899.99,
          stock_quantity: 12,
          min_stock_level: 3,
          max_stock_level: 50,
          is_active: true,
          attributes: JSON.stringify({ storage: '128GB', color: 'Black' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          item_id: itemMap['PHONE001'],
          code: 'PHONE001-256GB',
          purchase_price: 799.99,
          selling_price: 999.99,
          stock_quantity: 8,
          min_stock_level: 3,
          max_stock_level: 40,
          is_active: true,
          attributes: JSON.stringify({ storage: '256GB', color: 'Black' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          item_id: itemMap['TSHIRT001'],
          code: 'TSHIRT001-S',
          purchase_price: 8.99,
          selling_price: 19.99,
          stock_quantity: 25,
          min_stock_level: 5,
          max_stock_level: 100,
          is_active: true,
          attributes: JSON.stringify({ size: 'Small' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          item_id: itemMap['TSHIRT001'],
          code: 'TSHIRT001-M',
          purchase_price: 8.99,
          selling_price: 19.99,
          stock_quantity: 30,
          min_stock_level: 5,
          max_stock_level: 120,
          is_active: true,
          attributes: JSON.stringify({ size: 'Medium' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          item_id: itemMap['TSHIRT001'],
          code: 'TSHIRT001-L',
          purchase_price: 8.99,
          selling_price: 19.99,
          stock_quantity: 20,
          min_stock_level: 5,
          max_stock_level: 80,
          is_active: true,
          attributes: JSON.stringify({ size: 'Large' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          item_id: itemMap['JEANS001'],
          code: 'JEANS001-30',
          purchase_price: 25.99,
          selling_price: 49.99,
          stock_quantity: 15,
          min_stock_level: 3,
          max_stock_level: 50,
          is_active: true,
          attributes: JSON.stringify({ waist: '30' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          item_id: itemMap['JEANS001'],
          code: 'JEANS001-32',
          purchase_price: 25.99,
          selling_price: 49.99,
          stock_quantity: 20,
          min_stock_level: 3,
          max_stock_level: 60,
          is_active: true,
          attributes: JSON.stringify({ waist: '32' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          item_id: itemMap['JEANS001'],
          code: 'JEANS001-34',
          purchase_price: 25.99,
          selling_price: 49.99,
          stock_quantity: 18,
          min_stock_level: 3,
          max_stock_level: 55,
          is_active: true,
          attributes: JSON.stringify({ waist: '34' }),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('item_variants', itemVariants, { transaction });

      // Create Customers
      const customers = [
        {
          id: uuidv4(),
          name: 'John Doe',
          phone: '+1234567890',
          email: 'john.doe@email.com',
          address: '123 Main St, City, State 12345',
          tax_number: 'TAX123456',
          credit_limit: 1000.00,
          current_balance: 0.00,
          is_active: true,
          notes: 'Regular customer',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          name: 'Jane Smith',
          phone: '+1987654321',
          email: 'jane.smith@email.com',
          address: '456 Oak Ave, City, State 12345',
          tax_number: 'TAX789012',
          credit_limit: 500.00,
          current_balance: 0.00,
          is_active: true,
          notes: 'Premium customer',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          name: 'Bob Johnson',
          phone: '+1555123456',
          email: 'bob.johnson@email.com',
          address: '789 Pine Rd, City, State 12345',
          tax_number: 'TAX345678',
          credit_limit: 750.00,
          current_balance: 0.00,
          is_active: true,
          notes: 'Business customer',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          name: 'Walk-in Customer',
          phone: null,
          email: null,
          address: null,
          tax_number: null,
          credit_limit: 0.00,
          current_balance: 0.00,
          is_active: true,
          notes: 'Default walk-in customer',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('customers', customers, { transaction });

      // Create a sample cash register (closed initially)
      const cashRegister = {
        id: uuidv4(),
        clerk_user_id: 'demo-clerk-001',
        status: 'CLOSED',
        opening_amount: 0.00,
        closing_amount: 0.00,
        expected_amount: 0.00,
        actual_amount: 0.00,
        difference: 0.00,
        opening_notes: 'Demo cash register',
        closing_notes: null,
        opened_at: new Date(),
        closed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await queryInterface.bulkInsert('cash_registers', [cashRegister], { transaction });

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
      await queryInterface.bulkDelete('cash_movements', null, { transaction });
      await queryInterface.bulkDelete('cash_registers', null, { transaction });
      await queryInterface.bulkDelete('item_movements', null, { transaction });
      await queryInterface.bulkDelete('sale_items', null, { transaction });
      await queryInterface.bulkDelete('sales', null, { transaction });
      await queryInterface.bulkDelete('purchase_order_items', null, { transaction });
      await queryInterface.bulkDelete('purchase_orders', null, { transaction });
      await queryInterface.bulkDelete('item_variants', null, { transaction });
      await queryInterface.bulkDelete('items', null, { transaction });
      await queryInterface.bulkDelete('customers', null, { transaction });
      await queryInterface.bulkDelete('categories', null, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}; 