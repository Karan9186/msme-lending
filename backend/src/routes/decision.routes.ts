import { Router } from 'express';
import { validate } from '../middleware/validate';
import { decisionRequestSchema } from '../validators/decision.validator';
import {
  evaluateDecision,
  getDecisionById,
  getDecisionStats,
  getAllDecisions,
} from '../controllers/decision.controller';

const router = Router();

// POST /api/decision - Evaluate loan decision (main endpoint)
router.post('/', validate(decisionRequestSchema), evaluateDecision);

// GET /api/decision - Get all decisions
router.get('/', getAllDecisions);

// GET /api/decision/stats - Get decision statistics
router.get('/stats', getDecisionStats);

// GET /api/decision/:id - Get decision by ID
router.get('/:id', getDecisionById);

export default router;
