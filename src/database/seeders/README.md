# Database Seeders

This directory contains database seeders for populating the retail POS system with sample data for development and testing purposes.

## Available Seeders

### 1. Demo Data Seeder (`20241224000001-demo-data.js`)
Creates the foundational data for the system:
- **Categories**: Electronics, Clothing, Home & Garden, Sports & Outdoors, Books & Media
- **Items**: Various products across different categories with realistic pricing
- **Item Variants**: Different configurations for items (sizes, storage options, etc.)
- **Customers**: Sample customers including a default "Walk-in Customer"
- **Cash Register**: A closed demo cash register ready to be opened

### 2. Sample Transactions Seeder (`20241224000002-sample-transactions.js`)
Creates sample business transactions:
- **Sales**: 4 sample sales with different customers, items, and payment scenarios
- **Purchase Orders**: 2 sample purchase orders (one completed, one pending)
- **Item Movements**: Stock movement records for the sales
- **Updated Stock**: Stock quantities adjusted based on sales

## Running the Seeders

### Run All Seeders
```bash
npm run seed
```

### Undo All Seeders
```bash
npm run seed:undo
```

### Run Specific Seeder
```bash
npx sequelize-cli db:seed --seed 20241224000001-demo-data.js
```

### Undo Specific Seeder
```bash
npx sequelize-cli db:seed:undo --seed 20241224000001-demo-data.js
```

## Sample Data Overview

### Categories
- Electronics (Laptops, Phones)
- Clothing (T-shirts, Jeans)
- Home & Garden (Tools)
- Sports & Outdoors (Sports equipment)
- Books & Media (Books)

### Items with Variants
- **Dell Inspiron Laptop**: 8GB/16GB RAM variants
- **iPhone 13**: 128GB/256GB storage variants
- **Cotton T-Shirt**: Small/Medium/Large size variants
- **Blue Jeans**: Waist 30/32/34 variants

### Items without Variants
- Claw Hammer
- Soccer Ball
- The Great Gatsby (Book)

### Sample Customers
- John Doe (Regular customer)
- Jane Smith (Premium customer)
- Bob Johnson (Business customer)
- Walk-in Customer (Default for anonymous sales)

### Sample Sales
1. **Laptop Sale**: $839.99 (John Doe)
2. **iPhone Sale**: $894.99 with $50 discount (Jane Smith)
3. **Clothing Sale**: $73.48 (Bob Johnson)
4. **Tools & Sports**: $42.23 with $5 discount (John Doe)

### Sample Purchase Orders
1. **Electronics PO**: $1,260.00 (Completed)
2. **Clothing PO**: $525.00 (Pending)

## Notes

- All monetary values are in USD
- Dates are set relative to the current date for realistic testing
- Stock quantities are automatically adjusted based on sales
- The cash register starts closed and needs to be opened manually
- All sample data uses the clerk user ID `demo-clerk-001`

## Customization

You can modify the seeders to:
- Add more categories, items, or customers
- Change pricing and stock levels
- Add different types of transactions
- Modify the sample data to match your business needs

Remember to run `npm run seed:undo` before making changes to avoid conflicts with existing data. 