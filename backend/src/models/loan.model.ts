import { pgQuery } from '../config/database';
import { Loan, CreateLoanRequest } from '../types';

export class LoanModel {
  
  async create(businessId: string, data: CreateLoanRequest): Promise<Loan> {
    const query = `
      INSERT INTO loans (business_id, loan_amount, tenure_months, purpose)
      VALUES ($1, $2, $3, $4)
      RETURNING id, business_id as "businessId", loan_amount as "loanAmount", 
                tenure_months as "tenureMonths", purpose, 
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pgQuery<Loan>(query, [
      businessId,
      data.loanAmount,
      data.tenureMonths,
      data.loanPurpose,
    ]);

    return result.rows[0];
  }

  async findById(id: string): Promise<Loan | null> {
    const query = `
      SELECT id, business_id as "businessId", loan_amount as "loanAmount", 
             tenure_months as "tenureMonths", purpose, 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM loans 
      WHERE id = $1
    `;
    
    const result = await pgQuery<Loan>(query, [id]);
    return result.rows[0] || null;
  }

  async findByBusinessId(businessId: string): Promise<Loan[]> {
    const query = `
      SELECT id, business_id as "businessId", loan_amount as "loanAmount", 
             tenure_months as "tenureMonths", purpose, 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM loans 
      WHERE business_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pgQuery<Loan>(query, [businessId]);
    return result.rows;
  }

  async findAll(): Promise<Loan[]> {
    const query = `
      SELECT id, business_id as "businessId", loan_amount as "loanAmount", 
             tenure_months as "tenureMonths", purpose, 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM loans 
      ORDER BY created_at DESC
    `;
    
    const result = await pgQuery<Loan>(query);
    return result.rows;
  }
}

export const loanModel = new LoanModel();
