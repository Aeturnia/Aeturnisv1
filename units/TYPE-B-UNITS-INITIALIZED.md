# Type B Units Initialization Report

**Date:** 2025-07-07  
**Agent:** Interface-Implementation Agent  
**Priority:** HIGH (Service Implementation Blockers)

## Units Initialized

### TYPE-B-001: Combat Service Implementation
**Status:** Ready to Start  
**Files:** 
- Interface: `src/providers/interfaces/ICombatService.ts`
- Mock: `src/providers/mock/MockCombatService.ts`
- Real: `src/providers/real/RealCombatService.ts`
- Types: `src/types/combat.types.ts`

**Critical Errors to Fix:**
- Missing properties on CombatSession: `status`, `roundNumber`
- Property name mismatch: `currentTurnIndex` should be `currentTurn`
- Missing properties on Combatant: `charId`, `charName`
- DamageType import/export issues
- Controller calling optional legacy methods as required

**Baseline Error Count:** 50+ TypeScript errors

---

### TYPE-B-002: Monster Service Implementation
**Status:** Ready to Start  
**Files:** 
- Interface: `src/providers/interfaces/IMonsterService.ts`
- Mock: `src/providers/mock/MockMonsterService.ts`
- Real: `src/providers/real/RealMonsterService.ts`
- Types: `src/types/monster.types.ts`

**Critical Errors to Fix:**
- Missing properties on Monster: `currentHealth`, `baseHealth`, `displayName`, `name`
- Type synchronization between shared and server types
- Implementation methods not matching interface signatures

**Baseline Error Count:** 5 TypeScript errors

---

### TYPE-B-003: Currency Service Implementation
**Status:** Ready to Start  
**Files:** 
- Interface: `src/providers/interfaces/ICurrencyService.ts`
- Mock: `src/providers/mock/MockCurrencyService.ts`
- Real: `src/providers/real/RealCurrencyService.ts`

**Critical Errors to Fix:**
- Missing methods: `addCurrency`, `deductCurrency`, `transferCurrency`
- Tests calling methods not defined in interface
- Return type mismatches for currency operations

**Baseline Error Count:** 15+ test failures

---

### TYPE-B-004: Bank Service Implementation
**Status:** Ready to Start  
**Files:** 
- Interface: `src/providers/interfaces/IBankService.ts`
- Mock: `src/providers/mock/MockBankService.ts`
- Real: `src/providers/real/RealBankService.ts`

**Critical Errors to Fix:**
- Mixed API patterns (required vs optional methods)
- Test expectations not matching implementation
- Error handling inconsistencies

**Baseline Error Count:** 5+ test failures

---

### TYPE-B-005: NPC Service Implementation
**Status:** Ready to Start  
**Files:** 
- Interface: `src/providers/interfaces/INPCService.ts`
- Mock: `src/providers/mock/MockNPCService.ts`
- Real: `src/providers/real/RealNPCService.ts`

**Critical Errors to Fix:**
- Missing method: `getAvailableInteractions()`
- Controller calling methods not in interface
- Response type mismatches

**Baseline Error Count:** 1 TypeScript error

---

## Execution Strategy

1. **Fix TYPE-B-001 (Combat Service) First**
   - Has the most errors (50+)
   - Critical for combat system functionality
   - Complex but well-defined fixes

2. **Fix TYPE-B-003 (Currency Service) Second**
   - Many test failures depend on this
   - Clear method additions needed
   - Will unblock economic system tests

3. **Fix TYPE-B-002 (Monster Service) Third**
   - Straightforward property additions
   - Builds on Type A monster fixes

4. **Fix TYPE-B-004 (Bank Service) Fourth**
   - Design cleanup needed
   - Less critical path

5. **Fix TYPE-B-005 (NPC Service) Last**
   - Simple method addition
   - Single error fix

## Verification Protocol

For each unit:
```bash
# Before fix
npm run typecheck 2>&1 | grep -E "(ICombatService|MockCombatService|RealCombatService)" | grep -c "error"

# After fix
npm run typecheck 2>&1 | grep -E "(ICombatService|MockCombatService|RealCombatService)" | grep -c "error"

# Run specific service tests
npm test -- --run ICombatService
npm test -- --run MockCombatService
```

## Success Criteria

Each Type B unit is complete when:
1. Interface and all implementations have matching method signatures
2. All TypeScript errors related to the service are resolved
3. Service-specific tests pass
4. No regression in other services

## Interface-Implementation Agent Guidelines

1. **Always update interface first** if adding new methods
2. **Update both Mock and Real implementations** to match
3. **Preserve existing behavior** while fixing signatures
4. **Add proper return types** to all methods
5. **Ensure error handling** is consistent across implementations

## Next Steps

1. Assign TYPE-B-001 to Interface-Implementation Agent
2. Fix combat service interface-implementation mismatches
3. Verify error reduction and test passage
4. Document any design decisions or patterns discovered
5. Move to next unit only after current unit verification passes

---

*Type B Units initialized following ErrorFixv2.md strategy*