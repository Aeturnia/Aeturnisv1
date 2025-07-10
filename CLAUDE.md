# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aeturnis Online is a production-ready MMORPG platform built with TypeScript. It features real-time multiplayer capabilities, turn-based combat with AI, character progression (AIPE - Aeturnis Infinite Progression Engine), equipment systems, economy/banking, and comprehensive game mechanics.

## 🚩 Coding Standards (SOP)

This project follows strict coding standards as defined in aeturnis_coding_sop.md. Key rules:

### API-First Development
- **Every feature starts with an API contract** - Define interfaces/types before implementation
- **No implementation without a contract** - All code must trace to a defined API/interface
- **Mock dependencies when needed** - Use stubs when backend isn't ready

### Quality Gates (No Exceptions)
```bash
# These MUST pass before ANY commit:
npm run lint:ts && npm test --coverage
```
- **TypeScript strict mode** - No `any` types, no `@ts-ignore`
- **ESLint with zero errors** - Airbnb config, auto-formatted
- **Test coverage ≥80%** - No drops allowed
- **Any CI failure = Implementation halted**

### Self-Audit Requirements
Every implementation must include:
```markdown
### 🔐 Self-Audit Commands
\`\`\`bash
npm run lint:ts --max-warnings=0
npm test --coverage
\`\`\`
Results: [TS errors: 0] [Coverage: X%]
```

### Branch & Merge Discipline
- `main` - Always deployable
- `feat/*` - Micro-features (≤150 LOC)
- `fix/*` - Bug fixes
- **Merge only if**: CI green, coverage ≥80%, no TypeScript errors

### Service/Controller/Repository Pattern
- **Services**: Business logic only
- **Controllers**: HTTP handling only, NO business logic
- **Repositories**: All database access
- **Never mix concerns between layers**

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

### Adding a New Feature (Following SOP)
1. **Define API contract first** - Create interface/types before any implementation
2. Create feature branch: `git checkout -b feat/feature-name` (≤150 LOC per PR)
3. Add types to `/packages/shared/src/types/`
4. Implement service in `/packages/server/src/services/` (business logic only)
5. Add repository methods if needed (database access only)
6. Create controllers (HTTP handling only, no business logic)
7. Write comprehensive tests (must maintain ≥80% coverage)
8. Run self-audit commands and include results
9. Update Socket.IO handlers if real-time updates needed

### Security Requirements (Per SOP)
- **Always use parameterized queries** - Never raw SQL strings
- **Sanitize/validate all input** - Every endpoint, service, controller
- **Auth middleware on all protected routes** - Never bypass
- **Never expose stack traces** in production responses
- **Use secure Redis key patterns** for sessions/caching

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

## Systematic Error Resolution Process

### Overview
The project uses a systematic approach to resolve TypeScript and ESLint errors documented in ErrorCatalog.md and ErrorFixv2.md. This process employs specialized subagents working on micro-units.

### Error Resolution Commands
```bash
# Start a new error fix unit
./scripts/start-unit.sh <UNIT_ID> "<AGENT_NAME>"
# Example: ./scripts/start-unit.sh TYPE-B-001 "Service Implementation Agent"

# Complete a unit and generate report
./scripts/complete-unit.sh <UNIT_ID>

# Check progress across all units
./scripts/progress-dashboard-v2.sh
```

### Unit Types and Priority
1. **Type A: Type Definition Units** - Fix missing properties, interface mismatches
2. **Type B: Interface-Implementation Pairs** - Align service implementations with interfaces
3. **Type C: Controller-Service Integration** - Fix controller usage of services
4. **Type D: Database Operations** - Fix repository patterns, BigInt handling
5. **Type E: Route Handlers** - Fix request/response handling

### Service Implementation Pattern
When fixing Type B units (most common):
1. **Always update the interface first** if adding new methods
2. **Update both Mock and Real implementations** to match interface exactly
3. **Check the controller** to understand what properties/methods it expects
4. **Add backward compatibility** when renaming properties (e.g., alias properties)
5. **Ensure consistent types** between shared and server packages

### Common Type Fixes
```typescript
// Adding alias properties for backward compatibility
export interface CombatSession {
  currentTurn: number;
  currentTurnIndex: number; // Alias for backward compatibility
  // ... other properties
}

// Type conversions for service implementations
function convertToLegacyFormat(newType: NewType): LegacyType {
  return {
    // Map new properties to legacy format
  };
}
```

### Provider Pattern
The project uses a ServiceProvider pattern for dependency injection:
```typescript
// Getting services with proper typing
const combatService = ServiceProvider.getInstance().get<ICombatService>('CombatService');
```

### Error Resolution Workflow
1. Run `npm run typecheck 2>&1 | grep -E "<service-name>" | head -20` to isolate errors
2. Read the interface, mock, real, and controller files to understand mismatches
3. Fix types first, then interfaces, then implementations
4. Verify with `npm run typecheck -- <file-path>` for each modified file
5. Document changes in unit completion report

### Critical Files to Check
- **ErrorCatalog.md** - Complete list of all errors by category
- **ErrorFixv2.md** - Strategy document with templates and examples
- **Type_B_Units_Analysis.md** - Detailed analysis of service mismatches
- **units/<UNIT_ID>/completion-report.md** - Track what was fixed in each unit
- **aeturnis_coding_sop.md** - Golden rules for all development

## Production Readiness Checklist

Per the SOP, no feature is "done" without:
- [ ] Passing all tests (`npm test`)
- [ ] ESLint with zero errors (`npm run lint:ts --max-warnings=0`)
- [ ] Test coverage ≥80% (`npm run test:coverage`)
- [ ] TypeScript strict mode passes (`npm run typecheck`)
- [ ] No `any` types or `@ts-ignore` comments
- [ ] Self-audit output included in PR
- [ ] API contract/interface defined before implementation
- [ ] Proper separation of concerns (service/controller/repository)
- [ ] Security requirements met (parameterized queries, input validation)
- [ ] Documentation updated if needed

## Important Notes

1. **Never bypass the SOP**, even for "minor" changes
2. **Implementation stops if any quality gate fails**
3. **Every commit must pass all quality checks**
4. **Use micro-prompts** - One concern per implementation
5. **Always include self-audit results** in your work
6. **Always reference the /Implementation Reports/ folder for recent Implementation Reports to undertstand what Step of development the project is at**
7. **Follow the Phases.md file when preparing prompts or writing code for a particular step**
8. **When fixing service initialization issues, always add null checks to prevent race conditions**

Remember: The SOP is enforced across all contributions. Violations may result in auto-revert or blocked PRs.

## Recent Development Context

### Service Initialization Race Condition Fix (2025-01-10)
Fixed a critical race condition where React components were calling service hooks before services were initialized, causing "Services not initialized yet" errors and app crash.

**Root Cause:**
- Service hooks were being called before ServiceProvider completed initialization
- Hooks tried to call methods on null services
- Components rendered before ServiceInitializationWrapper could block them

**Fixes Applied:**
1. Added null checks to all service hook callbacks (useCharacter, useInventory, useLocation, useCombat)
2. Fixed state mapping in hooks (e.g., `inventoryState?.data?.items` instead of `inventoryState?.items`)
3. Protected component effects with null checks before calling service methods
4. Fixed environment check in ErrorBoundary (import.meta.env.MODE for Vite)
5. Enhanced useServices hook with complete mock implementation

**Key Pattern:**
```typescript
// Service hooks now have null checks
const getCharacter = useCallback(async () => {
  if (!characterService) {
    console.warn('Character service not initialized');
    return;
  }
  return characterService.getCharacter();
}, [characterService]);

// Components check before calling
useEffect(() => {
  if (getCharacter) {
    getCharacter()
  }
}, [getCharacter])
```

### Mock/Real Service Switching System (2025-01-10)
Implemented a complete mock/real service switching system with 17+ services:
- Environment variable control (VITE_USE_MOCKS)
- LocalStorage override for runtime switching
- Visual indicators (MockModeIndicator, SimpleDevToggle)
- ServiceTester component for validation
- Complete mock implementations with realistic game data

### Step 3.2: Core Game Interface Implementation (2025-01-10)
Created implementation prompt for Replit Agent (P3-3-02-core-game-interface.md) covering:
- Equipment UI components (slots, stats, drag-drop)
- Enhanced character stats display with tooltips
- Advanced HUD components (target frame, buffs/debuffs, minimap, quest tracker)
- Quick action toolbar (8-12 slots with cooldowns)
- Game text display and combat log
- Mobile HUD optimization

**Current UI State:**
- ✅ Basic CharacterScreen with stats display
- ✅ Simple GameScreen with basic HUD
- ✅ Service layer integration
- ❌ Equipment UI (service exists, no UI)
- ❌ Advanced HUD elements
- ❌ Quick action toolbar (only 3 hardcoded buttons)

### The Disconnect:
- Services are fully implemented for real API communication
- UI components (MapScreen, InventoryScreen, etc.) use hardcoded mocks
- No integration between the service layer and UI components

### Example:
```typescript
// What services provide:
const player = await usePlayer(); // Real API call

// What UI is doing:
const mockCharacter = { // Hardcoded data
  name: "Aria Starweaver",
  level: 42,
  // ...
};
```

### Missing Implementation:
1. Mock service classes for development
2. Environment variable support (VITE_USE_MOCKS)
3. Service factory for conditional instantiation
4. UI components using service hooks
5. Configuration for mock/real switching

### Todo Items Created:
- Add mock/real switching configuration to ServiceLayerConfig
- Create mock service implementations for development
- Add environment variable support (VITE_USE_MOCKS)
- Update UI components to use service hooks instead of hardcoded mocks
- Create a service factory for conditional mock/real instantiation

This explains why the UI shows static data - it's not connected to the service layer we built.