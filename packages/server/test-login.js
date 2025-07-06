const argon2 = require('argon2');

async function testLogin() {
  console.log('Testing login authentication...\n');
  
  // Test credentials from seed.ts
  const testCredentials = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'Test123!@#'
  };
  
  console.log('Test credentials:');
  console.log('- Email:', testCredentials.email);
  console.log('- Username:', testCredentials.username);
  console.log('- Password:', testCredentials.password);
  
  // Simulate the password hashing that was done during seeding
  const seedHash = await argon2.hash(testCredentials.password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
  
  console.log('\nPassword hash (sample):', seedHash.substring(0, 50) + '...');
  
  // Test verification
  const isValid = await argon2.verify(seedHash, testCredentials.password);
  console.log('Password verification test:', isValid);
  
  console.log('\nLogin endpoint expects:');
  console.log('POST /api/auth/login');
  console.log('Body: {');
  console.log('  "emailOrUsername": "test@example.com" (or "testuser"),');
  console.log('  "password": "Test123!@#"');
  console.log('}');
  
  console.log('\nPossible issues to check:');
  console.log('1. Environment variables (JWT_SECRET, JWT_REFRESH_SECRET)');
  console.log('2. Database connection');
  console.log('3. Case sensitivity in username/email (stored as lowercase)');
  console.log('4. Rate limiting (max 5 attempts per minute)');
}

testLogin().catch(console.error);