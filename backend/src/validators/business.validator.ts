import { z } from 'zod';
import { BusinessType } from '../types';

// PAN format: ABCDE1234F (5 letters + 4 digits + 1 letter)
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const createBusinessSchema = z.object({
  ownerName: z
    .string()
    .min(2, 'Owner name must be at least 2 characters')
    .max(255, 'Owner name must not exceed 255 characters')
    .trim(),
  pan: z
    .string()
    .regex(PAN_REGEX, 'Invalid PAN format. Expected: ABCDE1234F'),
  businessType: z.enum(['retail', 'manufacturing', 'services'] as const, {
    errorMap: () => ({ message: 'Business type must be retail, manufacturing, or services' }),
  }),
  monthlyRevenue: z
    .number()
    .positive('Monthly revenue must be greater than 0')
    .max(1000000000, 'Monthly revenue exceeds maximum allowed value'),
});

export type CreateBusinessSchema = z.infer<typeof createBusinessSchema>;
