'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove sku and barcode columns from items table
    await queryInterface.removeColumn('items', 'sku');
    await queryInterface.removeColumn('items', 'barcode');
    
    // Remove sku and barcode columns from item_variants table
    await queryInterface.removeColumn('item_variants', 'sku');
    await queryInterface.removeColumn('item_variants', 'barcode');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back sku and barcode columns to items table
    await queryInterface.addColumn('items', 'sku', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    
    await queryInterface.addColumn('items', 'barcode', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    
    // Add back sku and barcode columns to item_variants table
    await queryInterface.addColumn('item_variants', 'sku', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    
    await queryInterface.addColumn('item_variants', 'barcode', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  }
}; 