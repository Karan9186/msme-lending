// Business Types
export type BusinessType = 'retail' | 'manufacturing' | 'services';

export interface Business {
  id: string;
  ownerName: string;
  pan: string;
  businessType: BusinessType;
  monthlyRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBusinessRequest {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLoanRequest {
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

export interface Decision {
  id: string;
  loanId: string;
  businessId: string;
  decision: DecisionStatus;
  creditScore: number;
  reasons: ReasonCode[];
  details: DecisionDetails;
  createdAt: Date;
}

export interface DecisionDetails {
  emiAmount: number;
  emiToRevenueRatio: number;
  loanToRevenueRatio: number;
  revenueRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  tenureRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  fraudCheck: 'PASS' | 'FAIL';
}

export interface DecisionRequest {
  business: CreateBusinessRequest;
  loan: CreateLoanRequest;
}

export interface DecisionResponse {
  decision: DecisionStatus;
  creditScore: number;
  reasons: ReasonCode[];
  details: DecisionDetails;
}

// Error Types
export interface ApiError {
  error: string;
  field?: string;
  details?: string;
}

// Log Types
export interface LogEntry {
  requestId: string;
  timestamp: Date;
  method: string;
  path: string;
  ip: string;
  userAgent?: string;
  requestBody?: Record<string, unknown>;
  responseStatus: number;
  responseBody?: Record<string, unknown>;
  processingTimeMs: number;
}
