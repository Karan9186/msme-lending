// Business Types
export type BusinessType = 'retail' | 'manufacturing' | 'services';

export interface Business {
  id: string;
  ownerName: string;
  pan: string;
  businessType: BusinessType;
  monthlyRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessFormData {
  ownerName: string;
  pan: string;
  businessType: BusinessType;
  monthlyRevenue: number;
}

// Loan Types
export interface Loan {
  id: string;
  businessId: string;
  loanAmount: number;
  tenureMonths: number;
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanFormData {
  loanAmount: number;
  tenureMonths: number;
  loanPurpose: string;
}

// Decision Types
export type DecisionStatus = 'APPROVED' | 'REJECTED';

export type ReasonCode = 
  | 'LOW_REVENUE'
  | 'HIGH_LOAN_RATIO'
  | 'HIGH_EMI'
  | 'RISKY_TENURE'
  | 'FRAUD_SUSPECTED'
  | 'INVALID_DATA'
  | 'APPROVED';

export interface DecisionDetails {
  emiAmount: number;
  emiToRevenueRatio: number;
  loanToRevenueRatio: number;
  revenueRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  tenureRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  fraudCheck: 'PASS' | 'FAIL';
}

export interface DecisionResult {
  id?: string;
  businessId?: string;
  loanId?: string;
  decision: DecisionStatus;
  creditScore: number;
  reasons: ReasonCode[];
  details: DecisionDetails;
}

// Application Form (Combined)
export interface LoanApplicationForm {
  business: BusinessFormData;
  loan: LoanFormData;
}

// API Error
export interface ApiError {
  error: string;
  field?: string;
  details?: string;
}
