import { Request, Response, NextFunction } from 'express';
import { decisionEngine } from '../services/decisionEngine';
import { businessModel } from '../models/business.model';
import { loanModel } from '../models/loan.model';
import { decisionModel } from '../models/decision.model';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';
import { DecisionRequest, CreateBusinessRequest, CreateLoanRequest } from '../types';

export const evaluateDecision = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { business, loan }: DecisionRequest = req.body;
    
    logger.info('Evaluating loan decision', { 
      ownerName: business.ownerName, 
      pan: business.pan,
      loanAmount: loan.loanAmount 
    });

    // Run decision engine
    const decisionResult = decisionEngine.evaluate(business, loan);

    // Save business to database
    let savedBusiness;
    try {
      savedBusiness = await businessModel.create(business);
    } catch (error) {
      // If PAN already exists, fetch the existing business
      if (error instanceof Error && error.message.includes('unique constraint')) {
        savedBusiness = await businessModel.findByPan(business.pan);
        if (!savedBusiness) {
          throw new AppError('Error retrieving existing business', 500);
        }
      } else {
        throw error;
      }
    }

    // Save loan to database
    const savedLoan = await loanModel.create(savedBusiness.id, loan);

    // Save decision to database
    const savedDecision = await decisionModel.create({
      loanId: savedLoan.id,
      businessId: savedBusiness.id,
      decision: decisionResult.decision,
      creditScore: decisionResult.creditScore,
      reasons: decisionResult.reasons,
      details: decisionResult.details,
    });

    logger.info('Decision evaluated and saved', {
      decisionId: savedDecision.id,
      decision: decisionResult.decision,
      creditScore: decisionResult.creditScore,
    });

    res.status(201).json({
      ...decisionResult,
      id: savedDecision.id,
      businessId: savedBusiness.id,
      loanId: savedLoan.id,
    });
  } catch (error) {
    next(error);
  }
};

export const getDecisionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const decision = await decisionModel.findById(id);
    
    if (!decision) {
      throw new AppError('Decision not found', 404);
    }
    
    res.json(decision);
  } catch (error) {
    next(error);
  }
};

export const getDecisionStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await decisionModel.getDecisionStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getAllDecisions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decisions = await decisionModel.findAll();
    res.json(decisions);
  } catch (error) {
    next(error);
  }
};
