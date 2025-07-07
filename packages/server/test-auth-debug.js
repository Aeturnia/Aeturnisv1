const argon2 = require('argon2');

async function testPasswordHashing() {
  const testPassword = 'Test123!@#';
  
  // Create hash with the same options as AuthService
  const hash = await argon2.hash(testPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
  
  console.log('Test password:', testPassword);
  console.log('Generated hash:', hash);
  
  // Verify the hash
  const isValid = await argon2.verify(hash, testPassword);
  console.log('Verification result:', isValid);
  
  // Test with wrong password
  const wrongValid = await argon2.verify(hash, 'WrongPassword');
  console.log('Wrong password verification:', wrongValid);
}

testPasswordHashing().catch(console.error);