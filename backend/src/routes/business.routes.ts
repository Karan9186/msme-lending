import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createBusinessSchema } from '../validators/business.validator';
import {
  createBusiness,
  getBusinessById,
  getBusinessByPan,
  getAllBusinesses,
} from '../controllers/business.controller';

const router = Router();

// POST /api/business - Create new business
router.post('/', validate(createBusinessSchema), createBusiness);

// GET /api/business - Get all businesses
router.get('/', getAllBusinesses);

// GET /api/business/:id - Get business by ID
router.get('/:id', getBusinessById);

// GET /api/business/pan/:pan - Get business by PAN
router.get('/pan/:pan', getBusinessByPan);

export default router;
