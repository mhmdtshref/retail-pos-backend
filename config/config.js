require('dotenv').config();

// Sequelize CLI configuration
module.exports = {
    development: {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      define: {
        timestamps: true,
        underscored: true,
      },
      dialectOptions: {
        ssl: false,
      },
    },
    test: {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      define: {
        timestamps: true,
        underscored: true,
      },
      dialectOptions: {
        ssl: false,
      },
    },
    production: {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      define: {
        timestamps: true,
        underscored: true,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    },
  };