import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool, checkDatabaseConnection } from '../src/database/config';
import path from 'path';

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  // Check connection
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    process.exit(1);
  }

  try {
    // Run migrations
    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../src/database/migrations'),
    });
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute if called directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };