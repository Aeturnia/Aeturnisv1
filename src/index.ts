// Simple forwarding script to run the server from packages/server
const { spawn } = require('child_process');
const { join } = require('path');

const serverPath = join(__dirname, '..', 'packages', 'server');
const serverScript = join(serverPath, 'dist', 'index.js');

console.log('🚀 Starting Aeturnis Online Server...');
console.log(`📁 Server path: ${serverPath}`);
console.log(`📄 Server script: ${serverScript}`);

const serverProcess = spawn('node', [serverScript], {
  cwd: serverPath,
  stdio: 'inherit',
  env: { ...process.env }
});

serverProcess.on('close', (code: number | null) => {
  console.log(`🛑 Server process exited with code ${code}`);
});

serverProcess.on('error', (error: Error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});