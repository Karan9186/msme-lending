import { Pool, PoolConfig, QueryResult } from 'pg';
import mongoose from 'mongoose';
import logger from './logger';

// PostgreSQL Configuration
const pgConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'msme_lending',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pgPool = new Pool(pgConfig);

// PostgreSQL Connection Events
pgPool.on('connect', () => {
  logger.info('PostgreSQL pool connected');
});

pgPool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', err);
});

// PostgreSQL Query Helper
export const pgQuery = async <T extends Record<string, any> = Record<string, any>>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const result = await pgPool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug('PostgreSQL query executed', { 
      text: text.substring(0, 100), 
      duration: `${duration}ms`, 
      rows: result.rowCount 
    });
    return result;
  } catch (error) {
    logger.error('PostgreSQL query error', { text, error });
    throw error;
  }
};

// Initialize PostgreSQL Tables
export const initPostgresTables = async (): Promise<void> => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');

    // Create businesses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_name VARCHAR(255) NOT NULL,
        pan VARCHAR(10) NOT NULL UNIQUE,
        business_type VARCHAR(50) NOT NULL CHECK (business_type IN ('retail', 'manufacturing', 'services')),
        monthly_revenue DECIMAL(15, 2) NOT NULL CHECK (monthly_revenue > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create loans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        loan_amount DECIMAL(15, 2) NOT NULL CHECK (loan_amount > 0),
        tenure_months INTEGER NOT NULL CHECK (tenure_months > 0),
        purpose TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create decisions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS decisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        decision VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
        credit_score INTEGER NOT NULL CHECK (credit_score >= 0 AND credit_score <= 100),
        reasons JSONB NOT NULL DEFAULT '[]',
        details JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_loans_business_id ON loans(business_id);
      CREATE INDEX IF NOT EXISTS idx_decisions_loan_id ON decisions(loan_id);
      CREATE INDEX IF NOT EXISTS idx_decisions_business_id ON decisions(business_id);
      CREATE INDEX IF NOT EXISTS idx_businesses_pan ON businesses(pan);
    `);

    await client.query('COMMIT');
    logger.info('PostgreSQL tables initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to initialize PostgreSQL tables', error);
    throw error;
  } finally {
    client.release();
  }
};

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/msme_logs';

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

// Initialize all databases
export const initDatabases = async (): Promise<void> => {
  await initPostgresTables();
  await connectMongoDB();
};
