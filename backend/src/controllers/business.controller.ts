import { Request, Response, NextFunction } from 'express';
import { businessModel } from '../models/business.model';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const createBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const business = await businessModel.create(req.body);
    logger.info('Business created', { businessId: business.id, pan: business.pan });
    res.status(201).json(business);
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      next(new AppError('Business with this PAN already exists', 409, 'pan'));
      return;
    }
    next(error);
  }
};

export const getBusinessById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const business = await businessModel.findById(id);
    
    if (!business) {
      throw new AppError('Business not found', 404);
    }
    
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const getBusinessByPan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { pan } = req.params;
    const business = await businessModel.findByPan(pan);
    
    if (!business) {
      throw new AppError('Business not found', 404);
    }
    
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const getAllBusinesses = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businesses = await businessModel.findAll();
    res.json(businesses);
  } catch (error) {
    next(error);
  }
};
