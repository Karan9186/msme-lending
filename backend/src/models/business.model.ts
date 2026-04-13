import { pgQuery } from '../config/database';
import { Business, CreateBusinessRequest } from '../types';

export class BusinessModel {
  
  async create(data: CreateBusinessRequest): Promise<Business> {
    const query = `
      INSERT INTO businesses (owner_name, pan, business_type, monthly_revenue)
      VALUES ($1, $2, $3, $4)
      RETURNING id, owner_name as "ownerName", pan, business_type as "businessType", 
                monthly_revenue as "monthlyRevenue", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pgQuery<Business>(query, [
      data.ownerName,
      data.pan.toUpperCase(),
      data.businessType,
      data.monthlyRevenue,
    ]);

    return result.rows[0];
  }

  async findById(id: string): Promise<Business | null> {
    const query = `
      SELECT id, owner_name as "ownerName", pan, business_type as "businessType", 
             monthly_revenue as "monthlyRevenue", created_at as "createdAt", updated_at as "updatedAt"
      FROM businesses 
      WHERE id = $1
    `;
    
    const result = await pgQuery<Business>(query, [id]);
    return result.rows[0] || null;
  }

  async findByPan(pan: string): Promise<Business | null> {
    const query = `
      SELECT id, owner_name as "ownerName", pan, business_type as "businessType", 
             monthly_revenue as "monthlyRevenue", created_at as "createdAt", updated_at as "updatedAt"
      FROM businesses 
      WHERE pan = $1
    `;
    
    const result = await pgQuery<Business>(query, [pan.toUpperCase()]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<Business[]> {
    const query = `
      SELECT id, owner_name as "ownerName", pan, business_type as "businessType", 
             monthly_revenue as "monthlyRevenue", created_at as "createdAt", updated_at as "updatedAt"
      FROM businesses 
      ORDER BY created_at DESC
    `;
    
    const result = await pgQuery<Business>(query);
    return result.rows;
  }
}

export const businessModel = new BusinessModel();
