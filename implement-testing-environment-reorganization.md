# Testing Environment Reorganization Implementation

**For: Replit Agent  
Reference: /docs/implementation/testing-environment-strategy.md  
Project: Aeturnis Online Testing Environment**

## Overview

Implement a reorganized testing environment following the strategy document at `/docs/implementation/testing-environment-strategy.md`. Transform the current monolithic `App.tsx` (1217 lines) into a modular, component-based architecture with tab navigation and integrated Monster & NPC testing capabilities.

## Phase 1: Core Structure & Navigation

### 1. Component Structure
Create the following directory structure in `/test-client/src/`:

```
components/
├── layout/
│   ├── Header.tsx          # App header with title and API status indicator
│   ├── Navigation.tsx      # Tab-based navigation component
│   └── StatusPanel.tsx     # Service status display (Database, Redis, Socket.IO)
└── common/
    ├── ResponseViewer.tsx  # Reusable JSON response display
    ├── TestButton.tsx      # Standardized test button component
    └── LoadingSpinner.tsx  # Loading state indicator
```

### 2. Navigation Component
Implement tab-based navigation with these tabs:
- Auth
- Character  
- Combat
- Monsters (NEW)
- NPCs (NEW)
- Death
- Loot
- Logs (NEW)

Style the active tab with cyan accent color (#00bcd4). Add badge indicators for active operations.

### 3. Extract Existing Components
From the current `App.tsx`, extract these sections into separate components:

```
components/
├── auth/
│   ├── AuthPanel.tsx       # Contains both login and register
│   ├── LoginForm.tsx       # Login form component
│   └── RegisterForm.tsx    # Registration form component
├── character/
│   └── CharacterPanel.tsx  # Character testing section
├── combat/
│   └── CombatPanel.tsx     # Combat testing section (keep existing logic)
├── death/
│   └── DeathPanel.tsx      # Death & respawn testing
└── loot/
    └── LootPanel.tsx       # Loot system testing
```

### 4. State Management
Create custom hooks in `/src/hooks/`:

```typescript
// useAuth.ts - Manage authentication state and token
export const useAuth = () => {
  // Store token in localStorage for persistence
  // Provide login, logout, register functions
  // Return { token, isAuthenticated, user, login, logout, register }
};

// useApi.ts - Wrapper for API calls with auth headers
export const useApi = () => {
  // Automatically attach auth token to requests
  // Handle common error cases
  // Return { get, post, patch, delete }
};
```

## Phase 2: Monster System Integration

### 1. Monster Components
Create in `components/monsters/`:

```typescript
// MonsterPanel.tsx - Main monster testing interface
// Should include:
// - Zone selector dropdown (fetch zones from /api/v1/zones if available, otherwise mock)
// - Active monsters list
// - Spawn controls (admin only)
// - State management interface

// MonsterList.tsx - Display monsters in selected zone
// Features:
// - Show monster name, HP, state, position
// - Action buttons: Change State, Set Target, Kill
// - Real-time updates when Socket.IO is connected

// SpawnControl.tsx - Admin spawn interface
// Features:
// - List spawn points for selected zone
// - Manual spawn button
// - Respawn timer display
// - Max spawn configuration
```

### 2. Monster API Integration
Use these endpoints:
- `GET /api/v1/monsters/zone/:zoneId` - List monsters
- `GET /api/v1/monsters/spawn-points/:zoneId` - List spawn points
- `POST /api/v1/monsters/spawn` - Spawn monster (admin)
- `PATCH /api/v1/monsters/:monsterId/state` - Update state
- `DELETE /api/v1/monsters/:monsterId` - Kill monster

## Phase 3: NPC System Integration

### 1. NPC Components
Create in `components/npcs/`:

```typescript
// NPCPanel.tsx - Main NPC testing interface
// Should include:
// - Zone selector (shared with monsters)
// - NPC type filter
// - NPC list with interaction buttons

// NPCList.tsx - Display NPCs in zone
// Features:
// - Show NPC name, type, position
// - Start Dialogue button
// - Visual indicator for quest givers

// DialogueViewer.tsx - Interactive dialogue interface
// Features:
// - Display current dialogue text
// - Show available choices
// - Navigate dialogue tree
// - Display dialogue state/progress
```

### 2. NPC API Integration
Use these endpoints:
- `GET /api/v1/npcs/zone/:zoneId` - List NPCs
- `GET /api/v1/npcs/quest-givers/:zoneId` - List quest givers
- `POST /api/v1/npcs/:npcId/interact` - Start interaction
- `POST /api/v1/npcs/:npcId/dialogue/advance` - Advance dialogue

## Phase 4: Socket.IO Integration

### 1. Socket Service
Create `services/socket.ts`:

```typescript
// Initialize Socket.IO client connection
// Connect to ws://localhost:3001
// Handle authentication with JWT token
// Provide event subscription methods
// Auto-reconnect on disconnect
```

### 2. Real-Time Monitor
Create `components/logs/LogsPanel.tsx`:

```typescript
// Real-time event monitor showing:
// - Incoming socket events
// - Event filtering by type
// - JSON payload viewer
// - Timestamp for each event
// - Clear logs button
```

### 3. Socket Integration Points
- Monster state changes
- NPC dialogue updates  
- Combat events (already exist)
- Death notifications
- Loot drops

## Implementation Guidelines

### 1. Maintain Existing Functionality
- Don't break any existing test features
- Keep the same API endpoints and auth flow
- Preserve the visual styling and theme

### 2. Code Organization
- One component per file
- Use TypeScript interfaces for props
- Extract reusable styles to CSS modules or styled components
- Keep components under 200 lines

### 3. State Management
- Use React hooks (useState, useEffect)
- Lift shared state to parent components
- Consider using Context for global state (auth, selected zone)

### 4. Error Handling
- Show user-friendly error messages
- Log errors to console for debugging
- Graceful fallbacks for failed API calls

### 5. Visual Consistency
- Use existing color scheme:
  - Primary: #00bcd4 (cyan)
  - Success: #4caf50 (green)
  - Error: #f44336 (red)
  - Warning: #ff9800 (orange)
- Maintain dark theme with blur effects
- Keep responsive grid layout

## Deliverables

### Phase 1 (Priority)
1. Refactored App.tsx with tab navigation
2. Extracted auth, character, combat, death, and loot panels
3. Common components (ResponseViewer, TestButton, etc.)
4. Basic routing between tabs

### Phase 2
1. Complete Monster testing panel
2. Zone selection functionality
3. Monster list with actions
4. Spawn controls for admin

### Phase 3
1. Complete NPC testing panel
2. NPC list by zone
3. Interactive dialogue system
4. NPC type filtering

### Phase 4
1. Socket.IO connection service
2. Real-time event monitor
3. Integration with existing panels
4. Event filtering and logging

## Testing

After implementation, verify:
1. All existing tests still work
2. Tab navigation switches content correctly
3. Monster operations work with mock data
4. NPC interactions display dialogues
5. Socket events appear in monitor (when backend is running)
6. Mobile responsive layout works
7. Token persistence across page refreshes

## Notes

- Start with Phase 1 to establish the foundation
- Mock data is acceptable where APIs aren't ready
- Focus on functionality over perfect styling
- Keep console.log statements for debugging during development
- Comment complex logic for future maintenance

The goal is a modular, maintainable testing environment that can grow with the game while providing better organization and developer experience.