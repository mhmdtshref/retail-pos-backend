'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add store column to items table
    await queryInterface.addColumn('items', 'store', {
      type: Sequelize.ENUM('Mini Queen', 'Lariche'),
      allowNull: false,
      defaultValue: 'Lariche', // Default to women's store
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove store column from items table
    await queryInterface.removeColumn('items', 'store');
    
    // Remove the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_items_store";');
  }
}; 