import { db, pool, checkDatabaseConnection } from '../src/database/config';
import { sql } from 'drizzle-orm';

async function setupTestDatabase() {
  console.log('🚀 Setting up test database...');
  
  // Check connection
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }

  try {
    // Drop all tables in cascade to reset the database
    await db.execute(sql`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO CURRENT_USER;
      GRANT ALL ON SCHEMA public TO public;
    `);
    
    console.log('✅ Database reset successfully');
    
    // Apply the current schema by running the latest migration
    const migrationSQL = await import('fs').then(fs => 
      fs.readFileSync(__dirname + '/../src/database/migrations/0003_ambiguous_marten_broadcloak.sql', 'utf8')
    );
    
    await db.execute(sql.raw(migrationSQL));
    
    console.log('✅ Schema applied successfully');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute if called directly
if (require.main === module) {
  setupTestDatabase();
}

export { setupTestDatabase };