# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aeturnis Online is a production-ready MMORPG platform built with TypeScript. It features real-time multiplayer capabilities, turn-based combat with AI, character progression (AIPE - Aeturnis Infinite Progression Engine), equipment systems, economy/banking, and comprehensive game mechanics.

## Essential Commands

```bash
# Development
npm run dev              # Start development server (API: 5000, Socket.IO: 3001)
npm install             # Install all dependencies

# Testing - ALWAYS run before committing
npm test                # Run all tests
npm run test:coverage   # Run tests with coverage report (must be ≥80%)
npm run test:watch      # Run tests in watch mode

# Code Quality - MUST pass before commits
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run typecheck       # TypeScript type checking (strict mode)
npm run format          # Format code with Prettier

# Building
npm run build           # Build all packages

# Database (from server package)
npm run db:push --workspace=packages/server    # Push schema changes
npm run db:migrate --workspace=packages/server # Run migrations
npm run db:seed --workspace=packages/server    # Seed initial data
npm run db:reset --workspace=packages/server   # Reset database
```

## Architecture Overview

### Monorepo Structure
- `/packages/server` - Backend API and Socket.IO server
- `/packages/shared` - Shared types, constants, and utilities
- `/packages/client` - Frontend application (when present)

### Server Architecture Flow
```
Client → REST API (/api/v1/*) / Socket.IO → Routes/Handlers → Controllers → Services → Repositories → PostgreSQL
                                                    ↓                            ↓
                                              Auth Middleware              Cache (Redis/Memory)
```

### Key Server Directories
- `/src/routes/` - REST API endpoints
- `/src/controllers/` - Request handling and validation
- `/src/services/` - Core business logic (AuthService, CombatService, etc.)
- `/src/repositories/` - Database queries with Drizzle ORM
- `/src/database/` - Schema definitions and migrations
- `/src/sockets/` - Real-time Socket.IO handlers
- `/src/middleware/` - Auth, rate limiting, error handling
- `/src/__tests__/` - Test files (maintain ≥80% coverage)

## Critical Development Patterns

### Authentication
- JWT-based with access (15min) and refresh (7day) tokens
- All protected routes require valid JWT in Authorization header
- Socket.IO authentication via middleware on connection

### Database Patterns
- Use Drizzle ORM with full TypeScript types
- UUID primary keys for all entities
- Soft deletes with `isDeleted` flags
- Never use raw SQL - always use parameterized queries
- Index all foreign keys and frequently queried fields

### Real-time Communication
- Socket.IO rooms: user (private), zone, combat, party, guild
- Event naming: `namespace:action` (e.g., `combat:attack`)
- Always clean up rooms on disconnect
- Rate limiting: 10 messages per 10 seconds for chat

### Error Handling
- Use centralized error handler middleware
- Never expose sensitive data in error messages
- Log errors with context but sanitize user data
- Return structured error responses with appropriate HTTP codes

### Testing Requirements
- Minimum 80% test coverage (enforced by CI)
- Write tests for all new services and routes
- Use mocks for external dependencies (Redis, Socket.IO)
- Test both success and error cases

## Development Workflow

### Branch Strategy
- `main` - Production-ready, always deployable
- `feat/*` - New features (e.g., feat/death-loop)
- `fix/*` - Bug fixes
- Keep PRs small (≤150 LOC when possible)

### Pre-commit Checklist
1. Run `npm run lint:ts && npm test --coverage`
2. Ensure all TypeScript errors are resolved (NO @ts-ignore)
3. Verify test coverage remains ≥80%
4. Format code with `npm run format`

### Combat System v2.0
- Turn-based with 5-second cooldowns
- Resource management: HP, MP, Stamina
- AI combat with dynamic difficulty
- Death penalties: 80% XP loss, 100% gold loss, respawn at nearest point

### Character System
- 6 races: Human, Elf, Dwarf, Orc, Halfling, Dragonborn
- 6 classes: Warrior, Mage, Rogue, Cleric, Ranger, Paladin
- AIPE: Infinite progression with scaling XP requirements
- 10 equipment slots with durability and set bonuses

## Environment Setup

Required environment variables:
```
JWT_SECRET=<secure-random-string>
JWT_REFRESH_SECRET=<different-secure-random-string>
DATABASE_URL=postgresql://user:pass@localhost:5432/aeturnis
ENABLE_REDIS=false  # Set to true for production
PORT=5000          # API port
SOCKET_PORT=3001   # Socket.IO port
```

## Common Tasks

### Adding a New Feature
1. Create feature branch: `git checkout -b feat/feature-name`
2. Add types to `/packages/shared/src/types/`
3. Implement service in `/packages/server/src/services/`
4. Add repository methods if needed
5. Create routes and controllers
6. Write comprehensive tests
7. Update Socket.IO handlers if real-time updates needed

### Debugging
- Check server logs for detailed error messages
- Use `npm run dev` for hot-reloading during development
- Socket.IO admin UI available at `http://localhost:3001/admin`
- Database queries logged in development mode

### Performance Considerations
- Use database indexes for frequently queried fields
- Implement pagination for list endpoints (default: 20 items)
- Cache static data in Redis when available
- Use database transactions for multi-step operations