import { z } from 'zod';
import { createBusinessSchema } from './business.validator';
import { createLoanSchema } from './loan.validator';

export const decisionRequestSchema = z.object({
  business: createBusinessSchema,
  loan: createLoanSchema,
});

export type DecisionRequestSchema = z.infer<typeof decisionRequestSchema>;
