import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { databaseConfig } from './config';
import { logger } from '../utils/logger';

let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

export async function initializeDatabase() {
  try {
    logger.info('🔌 Creating database connection...');

    client = postgres(databaseConfig.url, {
      max: databaseConfig.maxConnections,
      idle_timeout: 20,
      connect_timeout: 10,
      onnotice: (notice) => {
        logger.info('📢 Database notice:', notice);
      },
    });

    db = drizzle(client);

    // Test the connection
    logger.info('🔍 Testing database connection...');
    await client`SELECT 1`;
    logger.info('✅ Database connection test passed');

    // Run migrations
    logger.info('🔄 Running database migrations...');
    await migrate(db, { migrationsFolder: './src/database/migrations' });
    logger.info('✅ Database migrations completed');

    // Set up connection monitoring
    setInterval(async () => {
      try {
        await client`SELECT 1`;
        logger.info('💓 Database heartbeat OK');
      } catch (error) {
        logger.error('💔 Database heartbeat failed:', error);
      }
    }, 60000); // Every minute

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('🚨 Database initialization failed:', error);
    console.error('🚨 Database error stack:', error.stack);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function getClient() {
  if (!client) {
    throw new Error('Database client not initialized');
  }
  return client;
}