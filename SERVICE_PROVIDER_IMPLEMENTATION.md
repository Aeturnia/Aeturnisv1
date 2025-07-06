# Service Provider Implementation Strategy

## Overview

This document outlines the systematic implementation of a Service Provider pattern to enable seamless switching between mock and production data sources. The implementation is designed to be non-disruptive with zero downtime.

## Current State Analysis

### Existing Architecture Issues
- **Mixed Implementation**: Routes contain hardcoded mock data while services implement full database operations
- **No Environment Toggle**: No mechanism to switch between mock and production modes
- **Inconsistent Patterns**: Some routes mix mock data with real service calls (e.g., NPC routes)
- **Tight Coupling**: Mock data is directly embedded in route files

### Architecture Strengths
- Well-defined service layer with clear interfaces
- Consistent response formats across endpoints
- Good separation between routes and business logic
- Existing type definitions in shared package

## Service Provider Architecture

### Core Components

```typescript
// 1. Service Interfaces
interface IMonsterService {
  getMonstersInZone(zoneId: string): Promise<Monster[]>
  spawnMonster(spawnPointId: string): Promise<Monster>
  updateMonsterState(monsterId: string, state: MonsterState, metadata?: any): Promise<Monster>
  killMonster(monsterId: string, killedBy: string): Promise<void>
  getMonsterTypes(): Promise<MonsterType[]>
  getSpawnPoints(zoneId: string): Promise<SpawnPoint[]>
}

interface INPCService {
  getNPCsInZone(zoneId: string): Promise<NPC[]>
  getNPCById(npcId: string): Promise<NPC | null>
  startInteraction(npcId: string, characterId: string): Promise<NPCInteraction>
  advanceDialogue(interactionId: string, choiceId: string): Promise<DialogueResponse>
  getQuestGivers(): Promise<NPC[]>
  getMerchants(): Promise<NPC[]>
}

// 2. Service Provider Registry
class ServiceProvider {
  private static instance: ServiceProvider
  private services: Map<string, any>
  
  static getInstance(): ServiceProvider
  register<T>(name: string, service: T): void
  get<T>(name: string): T
}
```

### Directory Structure

```
/packages/server/src/
├── providers/
│   ├── interfaces/
│   │   ├── IMonsterService.ts
│   │   └── INPCService.ts
│   ├── mock/
│   │   ├── MockMonsterService.ts
│   │   └── MockNPCService.ts
│   ├── real/
│   │   ├── RealMonsterService.ts
│   │   └── RealNPCService.ts
│   ├── ServiceProvider.ts
│   └── index.ts
├── mocks/
│   ├── data/
│   │   ├── monsters.mock.ts
│   │   └── npcs.mock.ts
│   └── index.ts
```

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
**Goal**: Add provider infrastructure without modifying existing functionality

#### Tasks:
1. **Create Directory Structure**
   - Set up providers directory hierarchy
   - Create interfaces for all services

2. **Implement Service Provider Core**
   ```typescript
   // ServiceProvider.ts
   export class ServiceProvider {
     private static instance: ServiceProvider
     private services = new Map<string, any>()
     
     static getInstance(): ServiceProvider {
       if (!ServiceProvider.instance) {
         ServiceProvider.instance = new ServiceProvider()
       }
       return ServiceProvider.instance
     }
     
     register<T>(name: string, service: T): void {
       this.services.set(name, service)
     }
     
     get<T>(name: string): T {
       const service = this.services.get(name)
       if (!service) {
         throw new Error(`Service ${name} not registered`)
       }
       return service as T
     }
   }
   ```

3. **Create Mock Services**
   - Copy existing mock data from routes
   - Implement all interface methods
   - Maintain same data structure and behavior

4. **Add Configuration**
   ```bash
   # .env.example
   USE_MOCKS=false  # Default to false (no change in behavior)
   ```

### Phase 2: Route Migration (Days 3-5)
**Goal**: Gradually migrate routes to use service provider

#### Migration Strategy:
1. **Start with Read-Only Endpoints**
   - GET /zones/:zoneId/monsters
   - GET /zones/:zoneId/npcs
   - Lower risk, easier to validate

2. **Service Registration on Startup**
   ```typescript
   // server initialization
   const provider = ServiceProvider.getInstance()
   
   if (config.services.useMocks) {
     provider.register('MonsterService', new MockMonsterService())
     provider.register('NPCService', new MockNPCService())
   } else {
     const cacheService = new CacheService(redisClient)
     provider.register('MonsterService', new MonsterService(cacheService))
     provider.register('NPCService', new NPCService(cacheService))
   }
   ```

3. **Route Migration Example**
   ```typescript
   // Before
   router.get('/zone/:zoneId', asyncHandler(async (req, res) => {
     const monsters = mockMonsters.filter(m => m.zoneId === req.params.zoneId)
     res.json({ success: true, data: { monsters } })
   }))
   
   // After
   router.get('/zone/:zoneId', asyncHandler(async (req, res) => {
     const monsterService = ServiceProvider.getInstance()
       .get<IMonsterService>('MonsterService')
     const monsters = await monsterService.getMonstersInZone(req.params.zoneId)
     res.json({ success: true, data: { monsters } })
   }))
   ```

4. **Validation After Each Endpoint**
   - Test with USE_MOCKS=true
   - Test with USE_MOCKS=false
   - Compare response formats

### Phase 3: Testing & Optimization (Days 6-7)
**Goal**: Ensure system stability and performance

#### Testing Strategy:
1. **Unit Tests**
   ```typescript
   describe('MockMonsterService', () => {
     it('should return monsters for a zone', async () => {
       const service = new MockMonsterService()
       const monsters = await service.getMonstersInZone('test-zone')
       expect(monsters).toHaveLength(2)
     })
   })
   ```

2. **Integration Tests**
   ```typescript
   describe('Service Provider Integration', () => {
     beforeEach(() => {
       process.env.USE_MOCKS = 'true'
       // Reinitialize services
     })
     
     it('should use mock services when configured', async () => {
       const response = await request(app)
         .get('/api/monsters/zone/test-zone')
       expect(response.body.data.monsters).toBeDefined()
     })
   })
   ```

3. **Performance Benchmarks**
   - Response time comparison (mock vs real)
   - Memory usage monitoring
   - Concurrent request handling

### Phase 4: Cleanup & Documentation (Day 8)
**Goal**: Remove redundancy and document the system

#### Tasks:
1. **Extract Mock Data**
   ```typescript
   // mocks/data/monsters.mock.ts
   export const mockMonsters: Monster[] = [
     {
       id: "mock-monster-1",
       name: "Test Goblin",
       // ... rest of data
     }
   ]
   ```

2. **Remove Route-Level Mocks**
   - Delete mock arrays from route files
   - Clean up unused imports

3. **Documentation**
   - Update API documentation
   - Create provider usage guide
   - Document configuration options

## Configuration Options

### Environment Variables
```bash
# Service Configuration
USE_MOCKS=true|false          # Enable mock services globally

# Future Enhancement Options
MOCK_DELAY=100               # Simulate network delay (ms)
MOCK_FAILURE_RATE=0.1        # Simulate random failures
SERVICE_MONSTER=mock|real    # Per-service override
SERVICE_NPC=mock|real        # Per-service override
```

### Advanced Configuration
```typescript
// config/services.ts
export const serviceConfig = {
  useMocks: process.env.USE_MOCKS === 'true',
  mockOptions: {
    persistState: true,        // Persist mock state between requests
    resetOnRestart: true,      // Reset mock data on server restart
    simulateDelay: 0,          // Add artificial delay to mock responses
  },
  serviceOverrides: {
    // Allow per-service mock/real configuration
    MonsterService: process.env.SERVICE_MONSTER || 'auto',
    NPCService: process.env.SERVICE_NPC || 'auto',
  }
}
```

## Rollback Strategy

### Phase-Specific Rollback

1. **Phase 1 Rollback**
   - No impact - provider code is isolated
   - Simply don't use the provider classes

2. **Phase 2 Rollback**
   - Set USE_MOCKS=false
   - Routes will use real services (existing behavior)
   - Or revert specific route changes

3. **Phase 3 Rollback**
   - Tests are isolated, no production impact

4. **Phase 4 Rollback**
   - Keep backup of original mock data
   - Can restore if needed

### Emergency Procedures
```bash
# Quick rollback
git revert <commit-hash>

# Disable provider system
USE_MOCKS=false npm start

# Use specific service versions
SERVICE_MONSTER=real SERVICE_NPC=mock npm start
```

## Success Metrics

### Functional Requirements
- [ ] All endpoints maintain same response format
- [ ] Zero breaking changes to API contracts
- [ ] Seamless switching via environment variable
- [ ] All existing tests pass

### Performance Requirements
- [ ] Response time < 100ms for mock services
- [ ] No memory leaks with mock data storage
- [ ] Concurrent request handling unchanged
- [ ] Startup time < 5 seconds

### Code Quality
- [ ] 80%+ test coverage for provider classes
- [ ] No TypeScript errors
- [ ] ESLint compliance
- [ ] Clear documentation

## Migration Checklist

### Pre-Implementation
- [ ] Create feature branch
- [ ] Backup current working state
- [ ] Document current API behavior
- [ ] Notify team of upcoming changes

### Phase 1
- [ ] Create provider directories
- [ ] Implement service interfaces
- [ ] Create ServiceProvider class
- [ ] Implement mock services
- [ ] Add environment configuration

### Phase 2
- [ ] Update server initialization
- [ ] Migrate GET endpoints
- [ ] Migrate POST endpoints
- [ ] Migrate PATCH/DELETE endpoints
- [ ] Validate each migration

### Phase 3
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Run performance benchmarks
- [ ] Test error scenarios
- [ ] Load testing

### Phase 4
- [ ] Extract mock data files
- [ ] Remove route-level mocks
- [ ] Update documentation
- [ ] Create usage examples
- [ ] Team training

### Post-Implementation
- [ ] Monitor production metrics
- [ ] Gather team feedback
- [ ] Plan future enhancements
- [ ] Close feature branch

## Future Enhancements

1. **Mock Data Management UI**
   - Web interface to modify mock data
   - Import/export mock datasets
   - Reset mock state on demand

2. **Advanced Mock Features**
   - Scenario-based mocking
   - Failure simulation
   - Latency simulation
   - Data generation utilities

3. **Service Mesh Integration**
   - Circuit breaker patterns
   - Service discovery
   - Health checks
   - Metrics collection

4. **Testing Improvements**
   - Automated mock/real comparison tests
   - Contract testing
   - Chaos engineering support

## Conclusion

This implementation strategy provides a low-risk, systematic approach to adding a Service Provider layer. The phased approach ensures zero downtime and maintains backward compatibility throughout the migration. The result will be a flexible system that can easily switch between mock and production data sources with a simple environment variable change.

## Questions or Concerns?

If you encounter any issues during implementation:
1. Check the rollback procedures for your current phase
2. Consult the emergency procedures section
3. Review the success metrics to validate functionality
4. Contact the team lead for assistance

Remember: The goal is to enhance the system without disrupting existing functionality. When in doubt, proceed cautiously and test thoroughly.