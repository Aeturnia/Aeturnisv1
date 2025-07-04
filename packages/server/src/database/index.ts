import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

// Create PostgreSQL connection pool
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Replit managed PostgreSQL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
db.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('🗄️  Connected to PostgreSQL database');
});

db.on('error', (err: Error) => {
  // eslint-disable-next-line no-console
  console.error('🚨 Database connection error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  // eslint-disable-next-line no-console
  console.log('🔌 Closing database connections...');
  await db.end();
  process.exit(0);
});

export default db;