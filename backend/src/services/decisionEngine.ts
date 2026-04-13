import { 
  CreateBusinessRequest, 
  CreateLoanRequest, 
  DecisionResponse, 
  DecisionStatus,
  ReasonCode,
  DecisionDetails 
} from '../types';

// Scoring Constants
const BASE_SCORE = 100;
const SCORE_THRESHOLDS = {
  APPROVAL: 60,
};

// Penalty Points
const PENALTIES = {
  HIGH_EMI: 30,
  HIGH_LOAN_RATIO: 40,
  RISKY_TENURE: 20,
  LOW_REVENUE: 25,
  FRAUD_SUSPECTED: 50,
};

// Risk Thresholds
const RISK_THRESHOLDS = {
  EMI_TO_REVENUE_MAX: 0.5,        // EMI should not exceed 50% of revenue
  LOAN_TO_REVENUE_MAX: 10,       // Loan should not exceed 10x monthly revenue
  TENURE_MIN: 6,                 // Less than 6 months is risky
  TENURE_MAX: 60,                // More than 60 months is risky
  FRAUD_LOAN_TO_REVENUE: 20,     // If loan/revenue > 20, likely fraud
  MIN_REVENUE: 10000,            // Minimum monthly revenue ₹10,000
};

interface RiskAssessment {
  score: number;
  reasons: ReasonCode[];
  details: DecisionDetails;
}

export class DecisionEngine {
  
  public evaluate(
    business: CreateBusinessRequest,
    loan: CreateLoanRequest
  ): DecisionResponse {
    // Calculate base metrics
    const emiAmount = this.calculateEMI(loan.loanAmount, loan.tenureMonths);
    const emiToRevenueRatio = emiAmount / business.monthlyRevenue;
    const loanToRevenueRatio = loan.loanAmount / business.monthlyRevenue;

    // Initialize assessment
    let score = BASE_SCORE;
    const reasons: ReasonCode[] = [];

    // 1. EMI to Revenue Ratio Check
    const emiRisk = this.assessEMIRisk(emiToRevenueRatio);
    if (emiRisk.isHighRisk) {
      score -= PENALTIES.HIGH_EMI;
      reasons.push('HIGH_EMI');
    }

    // 2. Loan to Revenue Ratio Check
    const loanRatioRisk = this.assessLoanRatioRisk(loanToRevenueRatio);
    if (loanRatioRisk.isHighRisk) {
      score -= PENALTIES.HIGH_LOAN_RATIO;
      reasons.push('HIGH_LOAN_RATIO');
    }

    // 3. Low Revenue Check
    const revenueRisk = this.assessRevenueRisk(business.monthlyRevenue);
    if (revenueRisk.isHighRisk) {
      score -= PENALTIES.LOW_REVENUE;
      reasons.push('LOW_REVENUE');
    }

    // 4. Tenure Risk Check
    const tenureRisk = this.assessTenureRisk(loan.tenureMonths);
    if (tenureRisk.isHighRisk) {
      score -= PENALTIES.RISKY_TENURE;
      reasons.push('RISKY_TENURE');
    }

    // 5. Fraud Check
    const fraudCheck = this.assessFraudRisk(loanToRevenueRatio, business.monthlyRevenue, loan.loanAmount);
    if (fraudCheck.isFraudSuspected) {
      score -= PENALTIES.FRAUD_SUSPECTED;
      reasons.push('FRAUD_SUSPECTED');
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Determine decision
    const decision: DecisionStatus = score >= SCORE_THRESHOLDS.APPROVAL ? 'APPROVED' : 'REJECTED';

    // Build details
    const details: DecisionDetails = {
      emiAmount: Math.round(emiAmount * 100) / 100,
      emiToRevenueRatio: Math.round(emiToRevenueRatio * 1000) / 1000,
      loanToRevenueRatio: Math.round(loanToRevenueRatio * 100) / 100,
      revenueRiskLevel: revenueRisk.level,
      tenureRiskLevel: tenureRisk.level,
      fraudCheck: fraudCheck.isFraudSuspected ? 'FAIL' : 'PASS',
    };

    return {
      decision,
      creditScore: score,
      reasons: reasons.length > 0 ? reasons : ['APPROVED'],
      details,
    };
  }

  private calculateEMI(loanAmount: number, tenureMonths: number): number {
    // Simple EMI calculation: P / n
    // In real world, this would include interest rate
    return loanAmount / tenureMonths;
  }

  private assessEMIRisk(emiToRevenueRatio: number): { isHighRisk: boolean; level: 'LOW' | 'MEDIUM' | 'HIGH' } {
    if (emiToRevenueRatio > RISK_THRESHOLDS.EMI_TO_REVENUE_MAX) {
      return { isHighRisk: true, level: 'HIGH' };
    }
    if (emiToRevenueRatio > 0.3) {
      return { isHighRisk: false, level: 'MEDIUM' };
    }
    return { isHighRisk: false, level: 'LOW' };
  }

  private assessLoanRatioRisk(loanToRevenueRatio: number): { isHighRisk: boolean; level: 'LOW' | 'MEDIUM' | 'HIGH' } {
    if (loanToRevenueRatio > RISK_THRESHOLDS.LOAN_TO_REVENUE_MAX) {
      return { isHighRisk: true, level: 'HIGH' };
    }
    if (loanToRevenueRatio > 5) {
      return { isHighRisk: false, level: 'MEDIUM' };
    }
    return { isHighRisk: false, level: 'LOW' };
  }

  private assessRevenueRisk(monthlyRevenue: number): { isHighRisk: boolean; level: 'LOW' | 'MEDIUM' | 'HIGH' } {
    if (monthlyRevenue < RISK_THRESHOLDS.MIN_REVENUE) {
      return { isHighRisk: true, level: 'HIGH' };
    }
    if (monthlyRevenue < 50000) {
      return { isHighRisk: false, level: 'MEDIUM' };
    }
    return { isHighRisk: false, level: 'LOW' };
  }

  private assessTenureRisk(tenureMonths: number): { isHighRisk: boolean; level: 'LOW' | 'MEDIUM' | 'HIGH' } {
    if (tenureMonths < RISK_THRESHOLDS.TENURE_MIN || tenureMonths > RISK_THRESHOLDS.TENURE_MAX) {
      return { isHighRisk: true, level: 'HIGH' };
    }
    if (tenureMonths < 12 || tenureMonths > 48) {
      return { isHighRisk: false, level: 'MEDIUM' };
    }
    return { isHighRisk: false, level: 'LOW' };
  }

  private assessFraudRisk(
    loanToRevenueRatio: number,
    monthlyRevenue: number,
    loanAmount: number
  ): { isFraudSuspected: boolean; reason?: string } {
    // Check 1: Extremely high loan-to-revenue ratio
    if (loanToRevenueRatio > RISK_THRESHOLDS.FRAUD_LOAN_TO_REVENUE) {
      return { 
        isFraudSuspected: true, 
        reason: 'Loan amount is unreasonably high compared to revenue' 
      };
    }

    // Check 2: Very low revenue but high loan request
    if (monthlyRevenue < 20000 && loanAmount > 500000) {
      return { 
        isFraudSuspected: true, 
        reason: 'Low revenue with high loan request' 
      };
    }

    return { isFraudSuspected: false };
  }
}

// Export singleton instance
export const decisionEngine = new DecisionEngine();
