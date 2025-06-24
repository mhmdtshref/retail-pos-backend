import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Retail POS API',
      version: '1.0.0',
      description: 'API documentation for Retail POS system',
    },
    servers: [
      {
        url: `${process.env.BACKEND_BASE_URL}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Customer ID',
            },
            name: {
              type: 'string',
              description: 'Customer name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email',
            },
            phone: {
              type: 'string',
              description: 'Customer phone number',
            },
            address: {
              type: 'string',
              description: 'Customer address',
            },
            taxNumber: {
              type: 'string',
              description: 'Customer tax number',
            },
            creditLimit: {
              type: 'number',
              format: 'float',
              description: 'Customer credit limit',
            },
            currentBalance: {
              type: 'number',
              format: 'float',
              description: 'Customer current balance',
            },
            isActive: {
              type: 'boolean',
              description: 'Customer active status',
            },
            notes: {
              type: 'string',
              description: 'Additional notes about the customer',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Customer creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Customer last update date',
            },
          },
          required: ['name'],
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export default options; 