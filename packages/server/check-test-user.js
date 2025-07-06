const { db } = require('./src/database/config');
const { users } = require('./src/database/schema');
const { eq, or } = require('drizzle-orm');

async function checkTestUser() {
  console.log('Checking for test user in database...');
  
  try {
    // Look for the test user
    const testUsers = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      passwordHash: users.passwordHash,
      roles: users.roles,
      createdAt: users.createdAt
    }).from(users).where(
      or(
        eq(users.email, 'test@example.com'),
        eq(users.username, 'testuser')
      )
    );
    
    if (testUsers.length > 0) {
      console.log('\nFound test user(s):');
      testUsers.forEach(user => {
        console.log('---');
        console.log('ID:', user.id);
        console.log('Email:', user.email);
        console.log('Username:', user.username);
        console.log('Has password hash:', !!user.passwordHash);
        console.log('Password hash length:', user.passwordHash?.length);
        console.log('Roles:', user.roles);
        console.log('Created at:', user.createdAt);
      });
    } else {
      console.log('\nNo test user found in database!');
      console.log('This might be why login is failing.');
      
      // Check if there are any users at all
      const allUsers = await db.select({
        email: users.email,
        username: users.username
      }).from(users);
      
      console.log('\nTotal users in database:', allUsers.length);
      if (allUsers.length > 0) {
        console.log('Existing users:');
        allUsers.forEach(u => console.log(`- ${u.username} (${u.email})`));
      }
    }
  } catch (error) {
    console.error('Error checking database:', error);
  }
  
  process.exit(0);
}

checkTestUser();