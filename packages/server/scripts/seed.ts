import { db, pool, checkDatabaseConnection } from '../src/database/config';
import { users, auditLog } from '../src/database/schema';
import { UserRole, AuditEventType } from '../src/types/db';
import * as argon2 from 'argon2';

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    process.exit(1);
  }

  try {
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
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute if called directly
if (require.main === module) {
  seed();
}

export { seed };