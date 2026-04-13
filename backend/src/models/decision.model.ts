import { pgQuery } from '../config/database';
import { Decision, DecisionStatus, ReasonCode, DecisionDetails } from '../types';

interface CreateDecisionData {
  loanId: string;
  businessId: string;
  decision: DecisionStatus;
  creditScore: number;
  reasons: ReasonCode[];
  details: DecisionDetails;
}

export class DecisionModel {
  
  async create(data: CreateDecisionData): Promise<Decision> {
    const query = `
      INSERT INTO decisions (loan_id, business_id, decision, credit_score, reasons, details)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, loan_id as "loanId", business_id as "businessId", decision, 
                credit_score as "creditScore", reasons, details, created_at as "createdAt"
    `;
    
    const result = await pgQuery<Decision>(query, [
      data.loanId,
      data.businessId,
      data.decision,
      data.creditScore,
      JSON.stringify(data.reasons),
      JSON.stringify(data.details),
    ]);

    return result.rows[0];
  }

  async findById(id: string): Promise<Decision | null> {
    const query = `
      SELECT id, loan_id as "loanId", business_id as "businessId", decision, 
             credit_score as "creditScore", reasons, details, created_at as "createdAt"
      FROM decisions 
      WHERE id = $1
    `;
    
    const result = await pgQuery<Decision>(query, [id]);
    return result.rows[0] || null;
  }

  async findByLoanId(loanId: string): Promise<Decision | null> {
    const query = `
      SELECT id, loan_id as "loanId", business_id as "businessId", decision, 
             credit_score as "creditScore", reasons, details, created_at as "createdAt"
      FROM decisions 
      WHERE loan_id = $1
    `;
    
    const result = await pgQuery<Decision>(query, [loanId]);
    return result.rows[0] || null;
  }

  async findByBusinessId(businessId: string): Promise<Decision[]> {
    const query = `
      SELECT id, loan_id as "loanId", business_id as "businessId", decision, 
             credit_score as "creditScore", reasons, details, created_at as "createdAt"
      FROM decisions 
      WHERE business_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pgQuery<Decision>(query, [businessId]);
    return result.rows;
  }

  async findAll(): Promise<Decision[]> {
    const query = `
      SELECT id, loan_id as "loanId", business_id as "businessId", decision, 
             credit_score as "creditScore", reasons, details, created_at as "createdAt"
      FROM decisions 
      ORDER BY created_at DESC
    `;
    
    const result = await pgQuery<Decision>(query);
    return result.rows;
  }

  async getDecisionStats(): Promise<{
    total: number;
    approved: number;
    rejected: number;
    avgCreditScore: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN decision = 'APPROVED' THEN 1 END) as approved,
        COUNT(CASE WHEN decision = 'REJECTED' THEN 1 END) as rejected,
        AVG(credit_score) as avg_credit_score
      FROM decisions
    `;
    
    const result = await pgQuery<{
      total: string;
      approved: string;
      rejected: string;
      avg_credit_score: string;
    }>(query);

    const row = result.rows[0];
    return {
      total: parseInt(row.total, 10),
      approved: parseInt(row.approved, 10),
      rejected: parseInt(row.rejected, 10),
      avgCreditScore: Math.round(parseFloat(row.avg_credit_score) * 10) / 10,
    };
  }
}

export const decisionModel = new DecisionModel();
