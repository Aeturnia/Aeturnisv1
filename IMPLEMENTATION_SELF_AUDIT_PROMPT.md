# Implementation Self-Audit Prompt for Replit

## Context
You need to perform a comprehensive self-audit of the current Aeturnis Online implementation, focusing on the Service Provider architecture and the 2.7 World & Movement system implementation status.

## Part 1: Service Provider Architecture Audit

### 1.1 Core Service Provider Files
Verify these files exist and are properly implemented:
- [ ] `/packages/server/src/providers/ServiceProvider.ts` - Core provider class
- [ ] `/packages/server/src/providers/index.ts` - Provider exports
- [ ] `/packages/server/src/providers/initializeProviders.ts` - Provider initialization

### 1.2 Service Interfaces
Check all interfaces are up-to-date:
- [ ] `IMonsterService` - Matches implementation methods
- [ ] `INPCService` - Matches implementation methods
- [ ] `IDeathService` - Matches implementation methods
- [ ] `ILootService` - Matches implementation methods
- [ ] `ICombatService` - Matches implementation methods
- [ ] `IBankService` - Matches implementation methods
- [ ] `ICurrencyService` - Single currency system (not multi-currency)
- [ ] `IDialogueService` - Matches implementation methods
- [ ] `ISpawnService` - Matches implementation methods

### 1.3 Mock Service Implementations
Verify all mock services implement their interfaces correctly:
- [ ] `MockMonsterService` - All interface methods implemented
- [ ] `MockNPCService` - All interface methods implemented
- [ ] `MockDeathService` - All interface methods implemented
- [ ] `MockLootService` - All interface methods implemented
- [ ] `MockCombatService` - All interface methods implemented
- [ ] `MockBankService` - All interface methods implemented
- [ ] `MockCurrencyService` - Uses number type (not bigint)
- [ ] `MockDialogueService` - All interface methods implemented
- [ ] `MockSpawnService` - All interface methods implemented

### 1.4 Service Provider Tests
Verify test coverage:
```bash
# Check if tests exist
ls packages/server/src/providers/__tests__/mock/

# Run provider tests
npm run test -- --testPathPattern="providers"
```

Expected test files:
- [ ] `MockMonsterService.test.ts`
- [ ] `MockNPCService.test.ts`
- [ ] `MockCurrencyService.test.ts`
- [ ] `ServiceProvider.test.ts`
- [ ] `ServiceProvider.integration.test.ts`

## Part 2: World & Movement System (2.7) Audit

### 2.1 Service Files
Check if these services exist:
```bash
# Zone, Movement, and Progression services
ls packages/server/src/services/mock/Mock{Zone,Movement,Progression}Service.ts
```

Expected files:
- [ ] `MockZoneService.ts` - Zone management service
- [ ] `MockMovementService.ts` - Movement validation service  
- [ ] `MockProgressionService.ts` - Experience/leveling service

### 2.2 Controllers
Verify controllers exist:
```bash
ls packages/server/src/controllers/{zone,movement,progression}.controller.ts
```

Expected files:
- [ ] `zone.controller.ts`
- [ ] `movement.controller.ts`
- [ ] `progression.controller.ts`

### 2.3 Routes
Verify routes exist:
```bash
ls packages/server/src/routes/{zone,movement,progression}.routes.ts
```

Expected files:
- [ ] `zone.routes.ts`
- [ ] `movement.routes.ts`
- [ ] `progression.routes.ts`

### 2.4 Route Registration
Check if routes are registered in app.ts:
```bash
grep -n "zones\|movement\|progression" packages/server/src/app.ts
```

Should find:
- [ ] `/api/v1/zones` route registration
- [ ] `/api/v1/movement` route registration
- [ ] `/api/v1/progression` route registration

### 2.5 Type Definitions
Check for type files:
```bash
ls packages/shared/types/{zone,movement,progression}.types.ts 2>/dev/null || \
ls packages/server/src/types/{zone,movement,progression}.types.ts 2>/dev/null
```

## Part 3: Build and Runtime Verification

### 3.1 TypeScript Compilation
```bash
# Run TypeScript build
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

Expected: 0 errors

### 3.2 Linting
```bash
# Run ESLint
npm run lint
```

Expected: 0 errors, minimal warnings

### 3.3 Test Suite
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

Target coverage: ≥80% for all metrics

## Part 4: API Endpoint Testing

### 4.1 Start the Server
```bash
npm run dev
```

### 4.2 Test Service Provider Debug Endpoint
```bash
# Check registered services
curl http://localhost:3000/api/debug/services
```

Expected: List of all registered services

### 4.3 Test Zone Endpoints (if implemented)
```bash
# Get all zones
curl http://localhost:3000/api/v1/zones

# Get specific zone
curl http://localhost:3000/api/v1/zones/starter_city
```

### 4.4 Test Movement Endpoints (if implemented)
```bash
# Test movement
curl -X POST http://localhost:3000/api/v1/movement/move \
  -H "Content-Type: application/json" \
  -d '{"characterId": "char_001", "currentZoneId": "starter_city", "direction": "north"}'
```

### 4.5 Test Progression Endpoints (if implemented)
```bash
# Get character progression
curl http://localhost:3000/api/v1/progression/char_001

# Award experience
curl -X POST http://localhost:3000/api/v1/progression/award-xp \
  -H "Content-Type: application/json" \
  -d '{"characterId": "char_001", "amount": "1000", "source": "quest"}'
```

## Part 5: Implementation Status Report

Generate a status report with this format:

```markdown
# Implementation Status Report
Date: [Current Date]

## Service Provider Architecture
Status: [COMPLETE/PARTIAL/NOT STARTED]

### Completed Components:
- [List completed items]

### Pending Components:
- [List pending items]

### Issues Found:
- [List any issues]

## World & Movement System (2.7)
Status: [COMPLETE/PARTIAL/NOT STARTED]

### Completed Components:
- [List completed items]

### Pending Components:
- [List pending items]

### Issues Found:
- [List any issues]

## Build Status
- TypeScript Errors: [number]
- ESLint Errors: [number]
- ESLint Warnings: [number]

## Test Results
- Total Tests: [number]
- Passing: [number]
- Failing: [number]
- Coverage:
  - Statements: [%]
  - Branches: [%]
  - Functions: [%]
  - Lines: [%]

## API Endpoints
- Total Registered: [number]
- Working: [number]
- Errors: [number]

## Recommendations
1. [Priority fixes needed]
2. [Next implementation steps]
3. [Improvement suggestions]
```

## Part 6: Quick Commands Reference

```bash
# Check all mock services
ls -la packages/server/src/providers/mock/

# Check service registration
grep -A 20 "initializeProviders" packages/server/src/providers/index.ts

# Find all test files
find packages/server -name "*.test.ts" -o -name "*.spec.ts" | sort

# Check for TODO comments
grep -r "TODO" packages/server/src --include="*.ts" | grep -v node_modules

# Check import errors
npm run build 2>&1 | grep -E "Cannot find module|Module not found"

# Verify BigInt usage in progression
grep -r "bigint\|BigInt" packages/server/src/services/mock/MockProgressionService.ts

# Check route imports
grep -E "import.*Routes" packages/server/src/app.ts
```

## Expected Outcomes

### For Service Provider:
- All 9 services registered and functional
- Mock implementations complete
- Tests passing with >80% coverage
- Zero TypeScript errors

### For World & Movement (2.7):
- 3 new services (Zone, Movement, Progression)
- 9 new API endpoints
- BigInt support for progression
- 6+ interconnected zones
- Movement validation with cooldowns

## Final Checklist
- [ ] All Service Provider interfaces updated
- [ ] All mock services implement updated interfaces
- [ ] Service Provider tests exist and pass
- [ ] World & Movement services implemented (or status known)
- [ ] Routes registered in app.ts
- [ ] Build completes without errors
- [ ] Tests run with adequate coverage
- [ ] API endpoints respond correctly
- [ ] Documentation is current