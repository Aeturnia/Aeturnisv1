# Mock/Real Service Switching System

## Overview

The Aeturnis Online frontend features a sophisticated Mock/Real Service Switching System that allows seamless development and testing with mock data while supporting production deployment with real backend services.

## System Architecture

### Service Layer
- **ServiceLayer class**: Core service orchestration with dependency injection
- **ServiceProvider**: React context provider for service access across components
- **Mock Services**: 14 comprehensive mock services with realistic game data
- **EventEmitter**: Event-driven communication for real-time updates

### Service List
1. **CharacterService** - Character stats, leveling, equipment
2. **InventoryService** - Item management, usage, movement
3. **LocationService** - World locations, travel, discovery
4. **CombatService** - Turn-based combat, sessions, actions
5. **MonsterService** - Monster data, spawning, AI
6. **NPCService** - NPC interactions, dialogue, quests
7. **DeathService** - Death penalties, resurrection
8. **LootService** - Item drops, rewards, rarity
9. **BankService** - Banking, storage, transactions
10. **CurrencyService** - Gold, currency operations
11. **DialogueService** - Conversation trees, responses
12. **SpawnService** - Entity spawning, locations
13. **ZoneService** - Zone management, boundaries
14. **MovementService** - Player movement, validation
15. **ProgressionService** - AIPE infinite progression
16. **TutorialService** - Tutorial quests, guidance
17. **AffinityService** - Weapon/magic affinity tracking

## Mock Mode Control

### 1. Environment Variable
```bash
VITE_USE_MOCKS=true
```

### 2. LocalStorage Override
```javascript
localStorage.setItem('VITE_USE_MOCKS', 'true')
```

### 3. Developer Tools Toggle
- Gear icon button (⚙️) in bottom-right corner
- Toggle between Mock and Real modes
- Requires page reload to take effect

## React Hooks

### useCharacter()
```typescript
const { character, getCharacter, updateStats, levelUp } = useCharacter()
```

### useInventory()
```typescript
const { items, getInventory, useItem, dropItem, moveItem } = useInventory()
```

### useLocation()
```typescript
const { currentLocation, getLocations, moveToLocation, discoverLocation } = useLocation()
```

### useCombat()
```typescript
const { session, startCombat, performAction, fleeCombat } = useCombat()
```

## Mock Data Examples

### Character (Aria Starweaver)
```typescript
{
  id: 'char-1',
  name: 'Aria Starweaver',
  level: 42,
  race: 'Elf',
  class: 'Mystic Archer',
  guild: 'Starlight Covenant',
  title: 'Voidwalker',
  attributes: { strength: 45, dexterity: 62, intelligence: 78 }
}
```

### Inventory Items
```typescript
[
  { name: 'Healing Potion', icon: '🧪', quantity: 5, rarity: 'common' },
  { name: 'Mana Crystal', icon: '💎', quantity: 3, rarity: 'uncommon' },
  { name: 'Ancient Tome', icon: '📜', quantity: 1, rarity: 'epic' },
  { name: 'Dragon Scale', icon: '🐉', quantity: 2, rarity: 'legendary' }
]
```

### Locations
```typescript
[
  { name: 'Mistwood Forest', type: 'forest', level: '1-10', discovered: true },
  { name: 'Crystal Caverns', type: 'dungeon', level: '15-25', completed: true },
  { name: 'Skyreach Tower', type: 'tower', level: '30-40' }
]
```

## Visual Indicators

### Mock Mode Badge
- Position: Top-left corner
- Icon: 🎭 (animated pulse)
- Text: "Mock Mode"
- Color: Yellow/amber theme

### Developer Tools Panel
- Toggle Button: Gear icon (⚙️) bottom-right
- Panel: Dark theme with service mode toggle
- Quick Actions: Clear storage, debug logging
- Environment Info: Mode, API URL, version

### Service Tester
- Button: "Test Services" bottom-left
- Panel: Live service validation interface
- Displays: Character, inventory, location, combat data
- Function: Real-time service testing

## Implementation

### Service Initialization
```typescript
// App.tsx
const serviceConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  useMockServices: import.meta.env.VITE_USE_MOCKS === 'true',
  mockConfig: {
    delay: 500,
    errorRate: 0,
    offlineMode: false
  }
}

<ServiceProvider config={serviceConfig}>
  <App />
</ServiceProvider>
```

### Service Registration
```typescript
// services/index.ts - ServiceLayer class
this.character = new MockCharacterService({ stateManager: this.stateManager }, this.config.mockConfig);
this.inventory = new MockInventoryService({ stateManager: this.stateManager }, this.config.mockConfig);
this.location = new MockLocationService({ stateManager: this.stateManager }, this.config.mockConfig);

ServiceProvider.register('CharacterService', this.character);
ServiceProvider.register('InventoryService', this.inventory);
ServiceProvider.register('LocationService', this.location);
```

## Testing

### Service Validation
1. Click "Test Services" button
2. Click "Test All Services" in panel
3. Check browser console for results
4. Verify data displays in service panels

### Mock Mode Toggle
1. Click gear icon (⚙️) 
2. Click "Switch to Real Mode" or "Switch to Mock Mode"
3. Page automatically reloads
4. Verify mock mode badge visibility

### Developer Tools
1. "Clear All Storage" - Removes localStorage/sessionStorage
2. "Log Debug Info" - Console logs current state
3. Environment info displays mode, API, version

## Production Deployment

### Real Services
- Set `VITE_USE_MOCKS=false` in environment
- Ensure backend API is accessible
- Services automatically switch to real implementations

### Mock Services (Development)
- Set `VITE_USE_MOCKS=true` in environment
- All services use local mock data
- No backend required for development

## Status

✅ **COMPLETE** - Mock/Real Service Switching System fully operational with 14+ services, comprehensive testing environment, and seamless development-to-production workflow.