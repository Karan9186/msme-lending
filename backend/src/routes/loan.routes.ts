import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createLoanSchema } from '../validators/loan.validator';
import {
  createLoan,
  getLoanById,
  getLoansByBusiness,
  getAllLoans,
} from '../controllers/loan.controller';

const router = Router();

// POST /api/loan/business/:businessId - Create loan for a business
router.post('/business/:businessId', validate(createLoanSchema), createLoan);

// GET /api/loan - Get all loans
router.get('/', getAllLoans);

// GET /api/loan/:id - Get loan by ID
router.get('/:id', getLoanById);

// GET /api/loan/business/:businessId - Get loans by business
router.get('/business/:businessId', getLoansByBusiness);

export default router;
