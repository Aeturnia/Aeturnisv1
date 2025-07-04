import { sql } from 'drizzle-orm';
import { db, pool, checkDatabaseConnection } from '../src/database/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { users, auditLog } from '../src/database/schema';
import { UserRole, AuditEventType } from '../src/types/db';
import argon2 from 'argon2';
import path from 'path';

async function reset() {
  console.log('🔄 Resetting database...');
  
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    process.exit(1);
  }

  try {
    // Drop all tables (cascade)
    console.log('📦 Dropping all tables...');
    await db.execute(sql`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO neondb_owner;
      GRANT ALL ON SCHEMA public TO public;
    `);

    console.log('✅ Tables dropped');

    // Run migrations directly in this process
    console.log('🚀 Starting database migrations...');
    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../src/database/migrations'),
    });
    console.log('✅ Migrations completed successfully');

    // Run seeding directly in this process
    console.log('🌱 Starting database seeding...');
    
    // Create admin user
    const adminPassword = await argon2.hash('Admin123!@#', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const [adminUser] = await db.insert(users).values({
      email: 'admin@aeturnis.com',
      username: 'admin',
      passwordHash: adminPassword,
      roles: [UserRole.ADMIN, UserRole.USER],
      emailVerified: true,
    }).returning();

    console.log('✅ Created admin user:', adminUser.email);

    // Create test user
    const testPassword = await argon2.hash('Test123!@#', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const [testUser] = await db.insert(users).values({
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: testPassword,
      roles: [UserRole.USER],
    }).returning();

    console.log('✅ Created test user:', testUser.email);

    // Add audit log entries
    await db.insert(auditLog).values([
      {
        actorId: adminUser.id,
        eventType: AuditEventType.USER_REGISTER,
        resourceType: 'user',
        resourceId: adminUser.id,
        payload: { email: adminUser.email },
      },
      {
        actorId: testUser.id,
        eventType: AuditEventType.USER_REGISTER,
        resourceType: 'user',
        resourceId: testUser.id,
        payload: { email: testUser.email },
      },
    ]);

    console.log('✅ Seeding completed successfully');
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute if called directly
if (require.main === module) {
  reset();
}