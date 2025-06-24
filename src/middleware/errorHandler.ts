import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/error';

export const errorHandler = (err: Error | AppError, req: Request, res: Response, _next: NextFunction): Response | null => {
    // Handle 404 errors
    if (!err) {
      return res.status(404).json({
        status: 'error',
        message: `Cannot ${req.method} ${req.originalUrl}`,
      });
    }

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
    }

    // Log unexpected errors
    logger.error({
      message: err.message,
      stack: err.stack,
    });

    // Send error response
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
};
