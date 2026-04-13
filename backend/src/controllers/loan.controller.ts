import { Request, Response, NextFunction } from 'express';
import { loanModel } from '../models/loan.model';
import { businessModel } from '../models/business.model';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const createLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { businessId } = req.params;
    
    // Verify business exists
    const business = await businessModel.findById(businessId);
    if (!business) {
      throw new AppError('Business not found', 404, 'businessId');
    }
    
    const loan = await loanModel.create(businessId, req.body);
    logger.info('Loan created', { loanId: loan.id, businessId, amount: loan.loanAmount });
    res.status(201).json(loan);
  } catch (error) {
    next(error);
  }
};

export const getLoanById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const loan = await loanModel.findById(id);
    
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    
    res.json(loan);
  } catch (error) {
    next(error);
  }
};

export const getLoansByBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { businessId } = req.params;
    
    // Verify business exists
    const business = await businessModel.findById(businessId);
    if (!business) {
      throw new AppError('Business not found', 404, 'businessId');
    }
    
    const loans = await loanModel.findByBusinessId(businessId);
    res.json(loans);
  } catch (error) {
    next(error);
  }
};

export const getAllLoans = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const loans = await loanModel.findAll();
    res.json(loans);
  } catch (error) {
    next(error);
  }
};
