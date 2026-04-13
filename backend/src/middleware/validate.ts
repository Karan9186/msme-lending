import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApiError } from '../types';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        const apiError: ApiError = {
          error: 'Invalid input',
          field: firstError.path.join('.'),
          details: firstError.message,
        };
        res.status(400).json(apiError);
        return;
      }
      next(error);
    }
  };
};
