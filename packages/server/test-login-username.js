const http = require('http');

async function testLoginWithUsername() {
  const loginData = {
    emailOrUsername: 'testuser',
    password: 'Test123!@#'
  };

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(loginData))
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.success) {
            console.log('\n✅ Login successful with username!');
            console.log('User ID:', parsed.data.user.id);
            console.log('Email:', parsed.data.user.email);
            console.log('Username:', parsed.data.user.username);
          } else {
            console.log('\n❌ Login failed:', parsed.error);
          }
        } catch (e) {
          console.log('Could not parse response as JSON');
        }
        
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });

    req.write(JSON.stringify(loginData));
    req.end();
  });
}

console.log('Testing login with username...');
console.log('Attempting to login with:');
console.log('- Username: testuser');
console.log('- Password: Test123!@#\n');

testLoginWithUsername().catch(console.error);