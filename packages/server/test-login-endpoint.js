const http = require('http');

async function testLoginEndpoint() {
  const loginData = {
    emailOrUsername: 'test@example.com',
    password: 'Test123!@#'
  };

  const options = {
    hostname: 'localhost',
    port: 5000,
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
        console.log('Response Headers:', res.headers);
        console.log('Response Body:', data);
        
        try {
          const parsed = JSON.parse(data);
          console.log('\nParsed Response:');
          console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('Could not parse response as JSON');
        }
        
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      console.log('\nMake sure the server is running on port 5000');
      reject(e);
    });

    req.write(JSON.stringify(loginData));
    req.end();
  });
}

console.log('Testing login endpoint...');
console.log('Attempting to login with:');
console.log('- Email: test@example.com');
console.log('- Password: Test123!@#\n');

testLoginEndpoint().catch(console.error);