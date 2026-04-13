import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { ApiError } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public field?: string;

  constructor(message: string, statusCode: number = 500, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.field = field;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error response
  let statusCode = 500;
  let errorResponse: ApiError = {
    error: 'Internal server error',
  };

  // Handle known application errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorResponse = {
      error: err.message,
      ...(err.field && { field: err.field }),
    };
  }
  // Handle PostgreSQL unique constraint violation
  else if (err.message && err.message.includes('unique constraint')) {
    statusCode = 409;
    errorResponse = {
      error: 'Resource already exists',
      details: err.message,
    };
  }
  // Handle PostgreSQL foreign key violations
  else if (err.message && err.message.includes('foreign key')) {
    statusCode = 400;
    errorResponse = {
      error: 'Invalid reference',
      details: 'The referenced resource does not exist',
    };
  }

  // Log the error
  logger.error('Error handling request', {
    error: err.message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const error: ApiError = {
    error: 'Resource not found',
    details: `Path ${req.method} ${req.path} does not exist`,
  };
  res.status(404).json(error);
};
