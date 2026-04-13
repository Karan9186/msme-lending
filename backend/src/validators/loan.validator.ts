import { z } from 'zod';

export const createLoanSchema = z.object({
  loanAmount: z
    .number()
    .positive('Loan amount must be greater than 0')
    .max(100000000, 'Loan amount exceeds maximum allowed value of 10 crores'),
  tenureMonths: z
    .number()
    .int('Tenure must be a whole number')
    .min(1, 'Tenure must be at least 1 month')
    .max(360, 'Tenure cannot exceed 360 months (30 years)'),
  loanPurpose: z
    .string()
    .min(5, 'Loan purpose must be at least 5 characters')
    .max(500, 'Loan purpose must not exceed 500 characters')
    .trim(),
});

export type CreateLoanSchema = z.infer<typeof createLoanSchema>;
