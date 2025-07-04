// Simple forwarding script to run the server from packages/server
import { spawn } from 'child_process';
import { join } from 'path';

const serverPath = join(__dirname, '..', 'packages', 'server');
const serverScript = join(serverPath, 'dist', 'index.js');

// eslint-disable-next-line no-console
console.log('🚀 Starting Aeturnis Online Server...');
// eslint-disable-next-line no-console
console.log(`📁 Server path: ${serverPath}`);
// eslint-disable-next-line no-console
console.log(`📄 Server script: ${serverScript}`);

const serverProcess = spawn('node', [serverScript], {
  cwd: serverPath,
  stdio: 'inherit',
  env: { ...process.env }
});

serverProcess.on('close', (code: number | null) => {
  // eslint-disable-next-line no-console
  console.log(`🛑 Server process exited with code ${code}`);
});

serverProcess.on('error', (error: Error) => {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});