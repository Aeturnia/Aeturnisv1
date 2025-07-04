import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load environment variables
dotenv.config();

// Test database connection pool with reasonable timeouts
export const testPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 10000,
  query_timeout: 10000,
});

// Drizzle instance with schema for tests
export const testDb = drizzle(testPool, { schema });

// Test database health check
export async function checkTestDatabaseConnection(): Promise<boolean> {
  try {
    await testPool.query('SELECT 1');
    // eslint-disable-next-line no-console
    console.log('✅ Test database connection established');
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Test database connection failed:', error);
    return false;
  }
}

// Graceful shutdown for tests
export async function closeTestDatabaseConnection(): Promise<void> {
  await testPool.end();
  // eslint-disable-next-line no-console
  console.log('Test database connection pool closed');
}