# Getting Started with Aeturnis Online Development

## Prerequisites

- Node.js 20 LTS or higher
- npm 8+ (included with Node.js)
- PostgreSQL 14+ (database is automatically provisioned in Replit)
- Git

## Project Status

**Current Implementation Level:** Production-Ready Express API Infrastructure
- ✅ Express server with comprehensive middleware stack
- ✅ JWT authentication system with Argon2id password hashing
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Rate limiting, security headers, and structured logging
- ✅ 26+ tests passing with production-ready error handling

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd aeturnis-online

# Install all dependencies
npm install
```

### 2. Environment Configuration

The project uses environment variables for configuration. In Replit, these are automatically configured:

```bash
# Required Environment Variables (auto-configured in Replit)
DATABASE_URL=postgresql://...        # PostgreSQL connection
JWT_SECRET=...                      # Access token secret
JWT_REFRESH_SECRET=...              # Refresh token secret

# Optional Environment Variables
NODE_ENV=development                # Environment mode
PORT=5000                          # Server port (default)
LOG_LEVEL=info                     # Logging level
```

For local development, copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
# Edit .env with your local PostgreSQL database URL and generate secure JWT secrets
```

### 3. Database Setup

The database schema is already implemented with Drizzle ORM:

```bash
# Generate new migrations (if schema changes)
npm run db:generate --workspace=packages/server

# Apply migrations to database
npm run db:push --workspace=packages/server

# View database in Drizzle Studio
npm run db:studio --workspace=packages/server
```

### 4. Development Workflow

#### Starting the Development Server

```bash
# Start the Express API server (primary development)
npm run dev

# The server will start on http://localhost:5000 with:
# - Health check: http://localhost:5000/health
# - API status: http://localhost:5000/api/status
# - Auth endpoints: http://localhost:5000/api/v1/auth/*
```

#### Running Tests

```bash
# Run all tests across packages
npm test

# Run tests with coverage
npm run test:coverage

# Run server-specific tests
npm test --workspace=packages/server

# Run in watch mode (during development)
npm run test:watch --workspace=packages/server
```

#### Code Quality

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Code formatting
npm run format

# Build for production
npm run build
```

#### Package Structure

```
packages/
├── server/                  # Express.js API server (main focus)
│   ├── src/
│   │   ├── app.ts          # Express application setup
│   │   ├── index.ts        # Server startup and lifecycle
│   │   ├── middleware/     # Production middleware stack
│   │   ├── routes/         # API route definitions  
│   │   ├── services/       # Business logic (AuthService)
│   │   ├── database/       # Database config and schema
│   │   └── utils/          # Shared utilities (logger, errors)
│   ├── drizzle/            # Database migrations
│   └── __tests__/          # Server test suites
├── client/                 # React frontend (basic setup)
└── shared/                 # Common types and utilities
```

## API Testing

### Authentication Endpoints

Test the authentication system with curl:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "securePassword123"
  }'

# Login user
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "securePassword123"
  }'

# Check system health
curl http://localhost:5000/health

# Get API status
curl http://localhost:5000/api/status
```

### Database Operations

```bash
# View current database schema
npm run db:studio --workspace=packages/server

# Reset database (development only)
npm run db:reset --workspace=packages/server

# Seed database with test data
npm run db:seed --workspace=packages/server
```

## Development Guidelines

### Code Quality Standards

- **TypeScript**: Strict mode enabled, zero compilation errors required
- **Testing**: Comprehensive test coverage with Vitest
- **Linting**: ESLint + Prettier with pre-commit hooks
- **Security**: Argon2id password hashing, JWT tokens, rate limiting
- **Logging**: Structured JSON logging with Winston

### Architecture Principles

- **Modular Design**: Separation of concerns with clear boundaries
- **Error Handling**: Structured error responses with request correlation
- **Security First**: Comprehensive security headers and input validation
- **Performance**: Sub-5ms response times with monitoring
- **Observability**: Request tracking and structured logging

### Git Workflow

1. Create feature branches from `main`
2. Follow conventional commit messages
3. Run tests and linting before committing (`npm run lint && npm test`)
4. Update documentation for architectural changes
5. Create pull requests for code review

## Troubleshooting

### Common Issues

**Port Conflicts**
- Default port is 5000, change via `PORT` environment variable
- Check if port is in use: `lsof -ti:5000`

**Database Connection Issues**
- Verify `DATABASE_URL` is set correctly
- Check database is running: `npm run db:push --workspace=packages/server`
- View connection logs in server output

**Authentication Issues**
- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Check password validation requirements (minimum 8 characters)
- Verify rate limiting isn't blocking requests (5 auth requests per 15 minutes)

**TypeScript Errors**
- Run type checking: `npm run typecheck`
- Check for missing dependencies: `npm install`
- Verify proper imports and exports

**Test Failures**
- Clean build: `npm run build --workspace=packages/server`
- Reset database between tests if needed
- Check environment variables are set for tests

### Performance Monitoring

```bash
# Monitor response times
curl -w "@curl-format.txt" -s http://localhost:5000/health

# Check server logs for slow requests (>1000ms warnings)
# Logs include request ID correlation for debugging
```

### Getting Help

- **API Reference**: [docs/api/README.md](../api/README.md)
- **Architecture**: [docs/architecture/](../architecture/)
- **Implementation Reports**: `Implementation Reports/` directory
- **Audit Reports**: `audit/` directory

## Production Deployment

### Environment Requirements

```bash
# Required environment variables for production
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=secure-random-string-256-bits
JWT_REFRESH_SECRET=different-secure-random-string-256-bits

# Optional production variables
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
LOG_LEVEL=warn
PORT=5000
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates configured
- [ ] CORS origins restricted to production domains
- [ ] Log file rotation configured
- [ ] Health check endpoint responding
- [ ] Rate limiting operational
- [ ] Security headers verified

## Next Steps

### Current Development Phase
You're ready to start developing MMORPG features on top of the production-ready Express API infrastructure.

### Recommended Next Steps
1. **Explore the Architecture**: Review [Express API Infrastructure](../architecture/express-api-infrastructure.md)
2. **API Integration**: Study the [API Documentation](../api/README.md)
3. **Database Schema**: Understand the [Database Schema](../architecture/database-schema.md)
4. **Game Development**: Begin implementing character and game systems
5. **Frontend Integration**: Connect React frontend to the API

### Development Priorities
- Character management system
- Game world and zones
- Real-time WebSocket integration
- Game mechanics (combat, inventory)
- Administrative interfaces