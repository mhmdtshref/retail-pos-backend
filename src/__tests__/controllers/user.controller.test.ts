import { Request, Response } from 'express';
import { UserController } from '../../controllers/user.controller';
import { User, UserRole } from '../../models/User';
import { AppError } from '../../utils/error';
import sequelize from '../../config/database';

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeAll(async () => {
    // Sync database before tests
    await sequelize.sync({ force: true });
  });

  beforeEach(() => {
    userController = new UserController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterAll(async () => {
    // Close database connection after tests
    await sequelize.close();
  });

  describe('register', () => {
    it('should create a new user and return token', async () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CASHIER,
      };

      await userController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.objectContaining({
              username: 'testuser',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              role: UserRole.CASHIER,
            }),
            token: expect.any(String),
          }),
        }),
      );
    });

    it('should not create user with existing email', async () => {
      // First create a user
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
        role: UserRole.CASHIER,
      });

      // Try to create another user with same email
      mockRequest.body = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.CASHIER,
      };

      await userController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CASHIER,
      });
    });

    it('should login with correct credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await userController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'test@example.com',
            }),
            token: expect.any(String),
          }),
        }),
      );
    });

    it('should not login with incorrect password', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await userController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
