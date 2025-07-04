import * as http from 'http';
import * as url from 'url';

export const greet = (name: string): string => {
  return `Hello, ${name}! Welcome to Aeturnis Online.`;
};

// Basic HTTP server implementation
const createServer = () => {
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url || '', true);
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Routes
    if (parsedUrl.pathname === '/') {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        message: greet('World'),
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }));
    } else if (parsedUrl.pathname === '/health') {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }));
    } else if (parsedUrl.pathname === '/api/status') {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        server: 'Aeturnis Online',
        status: 'operational',
        environment: process.env.NODE_ENV || 'development'
      }));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(404);
      res.end(JSON.stringify({
        error: 'Not Found',
        path: parsedUrl.pathname
      }));
    }
  });

  return server;
};

// Start server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = createServer();
  
  server.listen(PORT, () => {
    console.log(`🚀 Aeturnis Online server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 API status: http://localhost:${PORT}/api/status`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
    });
  });
}

export default createServer;