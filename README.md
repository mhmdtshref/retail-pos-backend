# Retail POS Backend API

A robust backend API for a Retail Point of Sale system built with Express.js, TypeScript, and PostgreSQL.

## Features

- 🔐 Authentication & Authorization
- 👥 User management with role-based access control
- 👤 Customer management
- 📦 Inventory management
  - Items and variants
  - Categories
  - Stock tracking
  - Movement history
- 💰 Sales management
  - Sales transactions
  - Sales items
  - Payment processing
- 📊 Purchase management
  - Purchase orders
  - Supplier management
  - Receiving
- 💸 Expense tracking
- 📈 Reporting and analytics

## Tech Stack

- Node.js & Express.js
- TypeScript
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Winston Logger
- Jest Testing

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retail_pos
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=debug
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/retail-pos-backend.git
   cd retail-pos-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Create the database
   createdb retail_pos

   # Run migrations
   npm run migrate

   # (Optional) Seed the database
   npm run seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Undo the last migration
- `npm run seed` - Seed the database
- `npm run seed:undo` - Undo the last seed

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get a user by ID
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers/:id` - Get a customer by ID
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/:id` - Get a category by ID
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create a new item
- `GET /api/items/:id` - Get an item by ID
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item
- `GET /api/items/:id/variants` - Get item variants
- `POST /api/items/:id/variants` - Create item variant

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create a new sale
- `GET /api/sales/:id` - Get a sale by ID
- `PUT /api/sales/:id` - Update a sale
- `DELETE /api/sales/:id` - Delete a sale

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/:id` - Get an expense by ID
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create a new supplier
- `GET /api/suppliers/:id` - Get a supplier by ID
- `PUT /api/suppliers/:id` - Update a supplier
- `DELETE /api/suppliers/:id` - Delete a supplier

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders
- `POST /api/purchase-orders` - Create a new purchase order
- `GET /api/purchase-orders/:id` - Get a purchase order by ID
- `PUT /api/purchase-orders/:id` - Update a purchase order
- `DELETE /api/purchase-orders/:id` - Delete a purchase order

## Error Handling

The API uses a centralized error handling system that returns appropriate HTTP status codes and error messages. Common error responses include:

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

## Logging

The application uses Winston for logging. Logs are written to both the console and files in the `logs` directory. Log levels can be configured in the `.env` file.

## Testing

Run tests using Jest:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 