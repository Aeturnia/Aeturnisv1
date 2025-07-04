import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

// Create PostgreSQL connection pool
export const db = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'aeturnis',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
db.on('connect', () => {
  console.log('🗄️  Connected to PostgreSQL database');
});

db.on('error', (err: Error) => {
  console.error('🚨 Database connection error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔌 Closing database connections...');
  await db.end();
  process.exit(0);
});

export default db;