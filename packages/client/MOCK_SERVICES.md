# Mock/Real Service Switching Guide

## Overview

The service layer now supports switching between mock and real services, allowing you to develop and test without a backend connection.

## How to Enable Mock Mode

### Method 1: Environment Variable
Create a `.env` file in the client package:
```bash
VITE_USE_MOCKS=true
```

### Method 2: Developer Tools Toggle
1. Open the app in development mode
2. Click the gear icon (⚙️) in the bottom right
3. Click "Switch to Mock" button
4. Page will reload with mock services

### Method 3: Configuration
In `App.tsx`, set `useMockServices: true` in the service config:
```typescript
const serviceConfig = {
  // ... other config
  useMockServices: true,
  mockConfig: {
    delay: 500, // Simulate network delay
    errorRate: 0, // No random errors
    offlineMode: false // Simulate offline state
  }
}
```

## Available Mock Services

### 1. MockCombatService
- Simulates combat sessions
- Provides mock combat actions
- Emits combat events

### 2. MockCharacterService
- Provides character data (Aria Starweaver, Lv 42 Elf Mystic Archer)
- Supports level up functionality
- Updates stats dynamically

### 3. MockInventoryService
- 5 default items (potions, crystals, etc.)
- Support for using, dropping, and moving items
- Inventory state management

### 4. MockLocationService
- 5 locations (Mistwood Forest, Crystal Caverns, etc.)
- Travel simulation with distance-based delays
- Location discovery system

## Using Services in Components

### Example: Character Screen
```typescript
import { useCharacter } from '../../hooks/useServices'

export function CharacterScreen() {
  const { 
    character,      // Character data
    isLoading,      // Loading state
    error,          // Error state
    getCharacter,   // Fetch character
    levelUp         // Level up action
  } = useCharacter()

  useEffect(() => {
    getCharacter() // Load on mount
  }, [getCharacter])

  // Render UI...
}
```

### Available Hooks
- `useCharacter()` - Character data and actions
- `useInventory()` - Inventory management
- `useLocation()` - Map and location services
- `useCombat()` - Combat system
- `useServices()` - Direct service access

## Mock Configuration Options

### Delay Simulation
```typescript
mockConfig: {
  delay: 1000 // 1 second delay for all operations
}
```

### Error Simulation
```typescript
mockConfig: {
  errorRate: 0.2 // 20% chance of random errors
}
```

### Offline Mode
```typescript
mockConfig: {
  offlineMode: true // Simulate being offline
}
```

## Visual Indicators

- **Mock Mode Badge**: Yellow "🎭 Mock Mode" indicator in top-left
- **Developer Tools**: Shows current service mode
- **Console Logs**: Mock services log initialization

## Development Workflow

1. **Start with Mocks**: Enable mock mode for UI development
2. **Test Features**: All service features work with mock data
3. **Switch to Real**: Disable mocks to test with real backend
4. **Deploy**: Mock mode is automatically disabled in production

## Adding New Mock Services

1. Create interface in `/services/provider/interfaces/`
2. Create mock implementation in `/services/mocks/`
3. Extend `MockService` base class
4. Register in `ServiceLayer`
5. Create hook in `useServices.ts`

## Benefits

- ✅ Develop without backend running
- ✅ Test edge cases with controlled data
- ✅ Simulate network conditions
- ✅ Fast iteration on UI
- ✅ Consistent test data
- ✅ Offline development