#!/usr/bin/env node
const http = require('http');

console.log('🔍 Testing server stability on port 8080...\n');

let testCount = 0;
let successCount = 0;
let lastSuccessTime = null;

function checkServer() {
  testCount++;
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      successCount++;
      const now = new Date();
      
      if (lastSuccessTime) {
        const uptime = Math.round((now - lastSuccessTime) / 1000);
        console.log(`✅ Test #${testCount}: Server is UP (uptime: ${uptime}s)`);
      } else {
        console.log(`✅ Test #${testCount}: Server is UP`);
      }
      
      lastSuccessTime = now;
    } else {
      console.log(`❌ Test #${testCount}: Server returned status ${res.statusCode}`);
      lastSuccessTime = null;
    }
  });

  req.on('error', (err) => {
    console.log(`❌ Test #${testCount}: Server is DOWN - ${err.message}`);
    lastSuccessTime = null;
  });

  req.on('timeout', () => {
    console.log(`❌ Test #${testCount}: Server timeout`);
    req.destroy();
    lastSuccessTime = null;
  });

  req.end();
}

// Check every 5 seconds
setInterval(checkServer, 5000);

// Initial check
checkServer();

// Summary every minute
setInterval(() => {
  const successRate = testCount > 0 ? Math.round((successCount / testCount) * 100) : 0;
  console.log(`\n📊 Summary: ${successCount}/${testCount} successful (${successRate}% uptime)\n`);
}, 60000);

console.log('Press Ctrl+C to stop monitoring\n');