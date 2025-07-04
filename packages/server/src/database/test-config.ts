import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load environment variables
dotenv.config();

// Test database connection pool with shorter timeouts
export const testPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 1000,
});

// Drizzle instance with schema for tests
export const testDb = drizzle(testPool, { schema });

// Test database health check
export async function checkTestDatabaseConnection(): Promise<boolean> {
  try {
    await testPool.query('SELECT 1');
    console.log('✅ Test database connection established');
    return true;
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    return false;
  }
}

// Graceful shutdown for tests
export async function closeTestDatabaseConnection(): Promise<void> {
  await testPool.end();
  console.log('Test database connection pool closed');
}