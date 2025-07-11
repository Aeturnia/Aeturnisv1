#!/usr/bin/env node

console.log('🔍 Testing Minimal Server');
console.log('========================');
console.log(`Current directory: ${process.cwd()}`);
console.log(`__dirname: ${__dirname}`);
console.log(`Environment PORT: ${process.env.PORT}`);

// Test loading .env file
const dotenv = require('dotenv');
const path = require('path');

// Try different paths for .env
const envPaths = [
  '.env',
  path.join(__dirname, '.env'),
  path.join(process.cwd(), '.env'),
  path.resolve(__dirname, '.env'),
];

console.log('\n📁 Searching for .env file:');
const fs = require('fs');
envPaths.forEach(envPath => {
  console.log(`Checking ${envPath}: ${fs.existsSync(envPath) ? '✅ EXISTS' : '❌ NOT FOUND'}`);
});

// Load .env
const result = dotenv.config({ path: path.join(__dirname, '.env') });
console.log('\n📋 Dotenv load result:', result.error ? `❌ Error: ${result.error.message}` : '✅ Success');

if (result.parsed) {
  console.log('Parsed values:', Object.keys(result.parsed).filter(k => k === 'PORT').map(k => `${k}=${result.parsed[k]}`));
}

const PORT = process.env.PORT || '8080';
console.log(`\n🚀 Final PORT value: ${PORT}`);

// Simple server
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT, pid: process.pid }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`Test with: curl http://localhost:${PORT}/health`);
});

// Keep running
setInterval(() => {
  console.log(`💚 Still running on port ${PORT} (PID: ${process.pid})`);
}, 10000);