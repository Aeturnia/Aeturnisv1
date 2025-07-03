# Getting Started with Aeturnis Online Development

## Prerequisites

- Node.js 20 LTS or higher
- npm 8+ or yarn 1.22+
- PostgreSQL 15+ (for database features)
- Redis 7+ (for caching and sessions)
- Git

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd aeturnis-online

# Install dependencies
npm install

# Copy environment files
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` file with your local settings:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aeturnis_dev
REDIS_URL=redis://localhost:6379

# Secrets (generate secure values)
JWT_SECRET=your-secure-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-key
```

### 3. Development Workflow

#### Starting Development Servers

```bash
# Start all services
npm run dev

# Or start specific packages
npm run dev:server    # Backend server on :3000
npm run dev:client    # Frontend client on :3001

# Run tests
npm test

# Type checking
npm run typecheck

# Build for production
npm run build
```

#### Package Structure

```
packages/
├── server/          # Express.js backend
├── client/          # React frontend
└── shared/          # Common utilities and types
```

### 4. Database Setup (Future)

```bash
# Set up databases
npm run db:setup

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Follow established naming conventions
- Write tests for new features

### Git Workflow

1. Create feature branches from `main`
2. Make focused commits with clear messages
3. Run tests before committing
4. Create pull requests for review

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` file
2. **TypeScript errors**: Run `npm run typecheck` to identify issues
3. **Missing dependencies**: Run `npm install` in root and packages

### Getting Help

- Check the [API Documentation](../api/README.md)
- Review [Architecture Documentation](../architecture/)
- Contact the development team

## Next Steps

1. Explore the [Game Design Documentation](../game-design/)
2. Review the [API Reference](../api/README.md)
3. Check out the [Contributing Guide](./contributing.md)