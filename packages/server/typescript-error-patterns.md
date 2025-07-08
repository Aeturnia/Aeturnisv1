# TypeScript Error Patterns - Detailed Analysis

## Pattern 1: Combat System Type Mismatches

### Missing Properties on CombatSession
```typescript
// Expected properties that are missing:
- status: CombatStatus
- roundNumber: number
- currentTurnIndex: number (should be currentTurn?)

// Current usage attempts:
combat.controller.ts(105,46): combat.status
combat.controller.ts(105,100): combat.roundNumber
combat.controller.ts(105,208): combat.currentTurnIndex
```

### Missing Properties on Combatant
```typescript
// Expected properties that are missing:
- charId: string
- charName: string

// Current usage:
combat.controller.ts(105,169): combatant.charId
combat.controller.ts(105,233): combatant.charName
```

### CombatResult Type Issues
```typescript
// Missing properties:
- code: string
- error handling is typed as 'unknown'

// Usage:
combat.controller.ts(225,83): result.code
combat.controller.ts(233,15): result.error (unknown type)
```

## Pattern 2: Service Method Signatures

### CombatService Interface Mismatch
```typescript
// Methods expecting wrong argument counts:
processCombatAction: Expected 2 args, called with 3
initiateCombat: Implementation expects different args

// Possibly undefined methods:
- getActiveCombat
- processCombatAction
- initiateCombat
- endCombat
```

### Missing Service Methods
```typescript
// DialogueService missing:
- startDialogue
- advanceDialogue
- endDialogue
- createDialogueTree (typo: createMockDialogueTree?)

// SpawnService missing:
- getSpawnPointsByZone
- getActiveMonstersAtSpawnPoint
- resetSpawnTimer
- updateSpawnPoint
- getZoneSpawnStats
- getSpawnPointById
```

## Pattern 3: Type Import Issues

### Missing Type Imports in MockCombatService
```typescript
// Types that need importing:
- CombatStartRequest
- CombatSessionNew (should be CombatSession?)
- CombatActionNew (should be CombatAction?)
- CombatResultNew (should be CombatResult?)
- CombatEndResult (should be CombatResult?)
- CharacterCombatStats
- ResourcePool
```

### Module Export Issues
```typescript
// Types declared but not exported:
- Direction from '@aeturnis/shared/types/movement.types'
- DamageType from '../interfaces/ICombatService'
```

## Pattern 4: Bank System Type Incompatibilities

### BankSlot Type Mismatch
```typescript
// Provider interface expects:
interface BankSlot {
  slotIndex: number;
  isEmpty: boolean;
  // ... other properties
}

// But implementation uses different type missing these properties
```

### BankTransferRequest Type Mismatch
```typescript
// Interface version missing:
- fromType: BankType
- toType: BankType
```

## Pattern 5: Monster Type Definition

### Missing Monster Properties
```typescript
// Expected properties:
- currentHealth: number
- baseHealth: number
- displayName: string
- name: string (or should displayName map to name?)
```

## Pattern 6: Currency/Transaction Issues

### Transaction Type Issues
```typescript
// Missing properties:
- source: string
- timestamp: Date

// Type mismatches:
- totalInCopper should have gold/silver/copper breakdown
- Metadata type expects object but receives string
```

### Missing Currency Methods
```typescript
// ICurrencyService missing:
- addCurrency
- transferCurrency
```

## Pattern 7: Equipment/Stats Issues

### DerivedStats Missing Properties
```typescript
// Expected effective stat properties:
- effectiveStrength
- effectiveDexterity
- effectiveIntelligence
- effectiveWisdom
- effectiveConstitution
- effectiveCharisma
```

### StatType Enum Incomplete
```typescript
// Missing stat types:
- min_damage
- max_damage
```

## Pattern 8: Test Setup Issues

### Jest Namespace Usage
```typescript
// Cannot use jest as value in:
- jest.useFakeTimers()
- jest.clearAllMocks()
- beforeEach/afterEach not defined
```

## Recommended Type Definition Updates

### 1. CombatSession Interface
```typescript
interface CombatSession {
  // Add missing properties:
  status: CombatStatus;
  roundNumber: number;
  currentTurn: number; // rename from currentTurnIndex
  // ... existing properties
}
```

### 2. Combatant Interface
```typescript
interface Combatant {
  // Add missing properties:
  charId: string;
  charName: string;
  // ... existing properties
}
```

### 3. CombatResult Interface
```typescript
interface CombatResult {
  // Add missing properties:
  code?: string;
  error?: Error; // properly typed instead of unknown
  // ... existing properties
}
```

### 4. Monster Interface
```typescript
interface Monster {
  // Add missing properties:
  currentHealth: number;
  baseHealth: number;
  displayName: string;
  name: string;
  // ... existing properties
}
```

### 5. Service Interface Alignment
- Ensure all mock services implement exact interface methods
- Fix method signatures to match interfaces
- Add missing methods to interfaces or implementations

## Database/Repository Issues

### Pool Type Issues
```typescript
// Pool is missing drizzle methods:
- select()
- insert()
- update()
- delete()
- transaction()

// Likely needs proper typing:
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
```