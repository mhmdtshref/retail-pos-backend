import { RequestHandler } from 'express';
import { getAuth, clerkMiddleware } from '@clerk/express';
import { AppError } from '../utils/error';
import { TransformedUser } from '../types/auth';

// Middleware to require authentication and transform auth object
export const requireAuthMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    // First verify authentication
    const auth = getAuth(req);
    
    if (!auth.userId) {
      return next(new AppError('You are not logged in.', 401));
    }

    // Transform auth to only contain user data
    const user: TransformedUser = {
      id: auth.userId,
      email: auth.sessionClaims?.email as string,
      firstName: auth.sessionClaims?.firstName as string,
      lastName: auth.sessionClaims?.lastName as string,
      role: auth.sessionClaims?.role as string || 'CASHIER'
    };

    req.auth = { user };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Authentication failed', 500));
  }
};

// Middleware to get user info if authenticated
export const withAuth: RequestHandler = async (req, _res, next) => {
  try {
    // First get auth info
    await clerkMiddleware()(req, _res, (err) => {
      if (err) return next(err);
    });

    // Get the auth object
    const auth = getAuth(req);
    
    if (!auth.userId) {
      return next(new AppError('You are not logged in.', 401));
    }

    // Transform auth to only contain user data
    const user: TransformedUser = {
      id: auth.userId,
      email: auth.sessionClaims?.email as string,
      firstName: auth.sessionClaims?.firstName as string,
      lastName: auth.sessionClaims?.lastName as string,
      role: auth.sessionClaims?.role as string || 'CASHIER'
    };

    req.auth = { user };

    next();
  } catch (error) {
    next(error);
  }
};

// Role-based access control middleware
export const requireRole = (...roles: string[]): RequestHandler => {
  return (req, _res, next) => {
    const auth = getAuth(req);
    
    if (!auth.userId) {
      return next(new AppError('You are not logged in.', 401));
    }

    // Get user's role from session claims
    const userRole = auth.sessionClaims?.role as string;
    if (!userRole || !roles.includes(userRole)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};
