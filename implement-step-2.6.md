# Monster & NPC Systems Implementation - API-First Approach

**For: Replit Agent  
Phase 2, Step 2.6 | Project: Aeturnis Online**

## Context

Implement Monster & NPC systems following API-first methodology. Focus on contracts, schemas, and scaffolding. **Do not** implement full business logic - use mocks and stubs. Redis is **disabled** during development - use in-memory storage patterns.

## Naming Conventions
- **API Endpoints**: kebab-case (e.g., `/spawn-points`)
- **DB Columns**: snake_case
- **TypeScript**: PascalCase for types/interfaces, camelCase for variables/functions
- **Socket Events**: entity:action pattern (e.g., `monster:spawned`, `npc:dialogue-started`)

## 1. Database Schema Migrations

Create migrations in `/packages/server/src/database/migrations/`:

### A. Monsters Table
```sql
CREATE TABLE monsters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monster_type_id UUID NOT NULL REFERENCES monster_types(id),
  zone_id UUID NOT NULL REFERENCES zones(id),
  position JSONB NOT NULL, -- {x, y, z}
  current_hp INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  state VARCHAR(20) NOT NULL DEFAULT 'idle', -- idle, patrol, combat, flee
  aggro_radius INTEGER NOT NULL DEFAULT 10,
  target_id UUID, -- current target character_id
  spawn_point_id UUID REFERENCES spawn_points(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  killed_at TIMESTAMP,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);
```

### B. Monster Types Table
```sql
CREATE TABLE monster_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL,
  base_hp INTEGER NOT NULL,
  base_attack INTEGER NOT NULL,
  base_defense INTEGER NOT NULL,
  experience_value INTEGER NOT NULL,
  loot_table_id UUID REFERENCES loot_tables(id),
  ai_behavior VARCHAR(50) NOT NULL DEFAULT 'aggressive', -- aggressive, defensive, neutral
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### C. Spawn Points Table
```sql
CREATE TABLE spawn_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id),
  position JSONB NOT NULL,
  monster_type_id UUID NOT NULL REFERENCES monster_types(id),
  respawn_time INTEGER NOT NULL DEFAULT 300, -- seconds
  max_spawns INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### D. NPCs Table
```sql
CREATE TABLE npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- merchant, quest_giver, guard, etc.
  zone_id UUID NOT NULL REFERENCES zones(id),
  position JSONB NOT NULL,
  dialogue_tree_id UUID,
  is_quest_giver BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);
```

### E. NPC Interactions Table
```sql
CREATE TABLE npc_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npc_id UUID NOT NULL REFERENCES npcs(id),
  character_id UUID NOT NULL REFERENCES characters(id),
  interaction_type VARCHAR(50) NOT NULL, -- talk, trade, quest_start, quest_complete
  dialogue_state JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 2. TypeScript Interfaces

Create in `/packages/shared/src/types/`:

### monster.types.ts
```typescript
export enum MonsterState {
  IDLE = 'idle',
  PATROL = 'patrol',
  COMBAT = 'combat',
  FLEE = 'flee'
}

export enum AIBehavior {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  NEUTRAL = 'neutral'
}

export interface Monster {
  id: string;
  monsterTypeId: string;
  zoneId: string;
  position: Position3D;
  currentHp: number;
  maxHp: number;
  state: MonsterState;
  aggroRadius: number;
  targetId?: string;
  spawnPointId?: string;
}

export interface MonsterType {
  id: string;
  name: string;
  displayName: string;
  level: number;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  experienceValue: number;
  lootTableId?: string;
  aiBehavior: AIBehavior;
  metadata: Record<string, unknown>;
}

export interface SpawnPoint {
  id: string;
  zoneId: string;
  position: Position3D;
  monsterTypeId: string;
  respawnTime: number;
  maxSpawns: number;
  isActive: boolean;
}

export interface MonsterSpawnRequest {
  spawnPointId: string;
}

export interface MonsterStateUpdateRequest {
  monsterId: string;
  newState: MonsterState;
  targetId?: string;
}
```

### npc.types.ts
```typescript
export enum NPCType {
  MERCHANT = 'merchant',
  QUEST_GIVER = 'quest_giver',
  GUARD = 'guard',
  TRAINER = 'trainer',
  INNKEEPER = 'innkeeper'
}

export interface NPC {
  id: string;
  name: string;
  displayName: string;
  type: NPCType;
  zoneId: string;
  position: Position3D;
  dialogueTreeId?: string;
  isQuestGiver: boolean;
  metadata: Record<string, unknown>;
}

export interface NPCInteraction {
  id: string;
  npcId: string;
  characterId: string;
  interactionType: string;
  dialogueState: Record<string, unknown>;
  createdAt: Date;
}

export interface DialogueNode {
  id: string;
  text: string;
  choices?: DialogueChoice[];
  actions?: DialogueAction[];
  conditions?: DialogueCondition[];
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string;
  conditions?: DialogueCondition[];
}

export interface StartInteractionRequest {
  characterId: string;
}

export interface AdvanceDialogueRequest {
  characterId: string;
  choiceId: string;
}
```

## 3. API Routes

Create scaffolded routes with mock responses:

### /packages/server/src/routes/monster.routes.ts
```typescript
router.get('/monsters/zone/:zoneId', authenticate, async (req, res) => {
  // TODO: Implement actual query
  const mockMonsters = [
    {
      id: 'mock-monster-1',
      monsterTypeId: 'goblin',
      position: { x: 100, y: 0, z: 100 },
      currentHp: 50,
      maxHp: 50,
      state: 'idle'
    }
  ];
  res.json({ success: true, data: mockMonsters });
});

router.post('/monsters/spawn', authenticate, authorize('admin'), async (req, res) => {
  // TODO: Implement spawn logic
  res.json({ 
    success: true, 
    data: { 
      monsterId: 'newly-spawned-monster',
      message: 'Monster spawned successfully' 
    }
  });
});

router.patch('/monsters/:monsterId/state', authenticate, async (req, res) => {
  // TODO: Implement state update
  res.json({ success: true, message: 'Monster state updated' });
});
```

### /packages/server/src/routes/npc.routes.ts
```typescript
router.get('/npcs/zone/:zoneId', authenticate, async (req, res) => {
  // TODO: Implement actual query
  const mockNPCs = [
    {
      id: 'mock-npc-1',
      name: 'village_elder',
      displayName: 'Elder Marcus',
      type: 'quest_giver',
      position: { x: 50, y: 0, z: 50 },
      isQuestGiver: true
    }
  ];
  res.json({ success: true, data: mockNPCs });
});

router.post('/npcs/:npcId/interact', authenticate, async (req, res) => {
  // TODO: Implement interaction start
  const mockDialogue = {
    nodeId: 'greeting',
    text: 'Welcome, traveler! How may I help you?',
    choices: [
      { id: 'quest', text: 'Do you have any quests?' },
      { id: 'goodbye', text: 'Goodbye' }
    ]
  };
  res.json({ success: true, data: mockDialogue });
});

router.post('/npcs/:npcId/dialogue/advance', authenticate, async (req, res) => {
  // TODO: Implement dialogue advancement
  res.json({ 
    success: true, 
    data: { 
      nodeId: 'quest_offer',
      text: 'I need help clearing goblins from the forest.',
      actions: [{ type: 'quest_start', questId: 'goblin_menace' }]
    }
  });
});
```

## 4. Services (Scaffolded)

### /packages/server/src/services/MonsterService.ts
```typescript
export class MonsterService {
  constructor(
    private monsterRepository: MonsterRepository,
    private spawnService: SpawnService
  ) {}

  async spawnMonster(spawnPointId: string): Promise<Monster> {
    // TODO: Implement spawn logic
    // 1. Get spawn point details
    // 2. Create monster instance
    // 3. Emit socket event
    throw new Error('Not implemented');
  }

  async updateMonsterState(monsterId: string, newState: MonsterState): Promise<void> {
    // TODO: Implement state machine logic
    throw new Error('Not implemented');
  }

  async processAggro(monsterId: string, characterPosition: Position3D): Promise<boolean> {
    // TODO: Calculate distance and check aggro radius
    return false;
  }
}
```

### /packages/server/src/services/NPCService.ts
```typescript
export class NPCService {
  constructor(
    private npcRepository: NPCRepository,
    private dialogueService: DialogueService
  ) {}

  async startInteraction(npcId: string, characterId: string): Promise<DialogueNode> {
    // TODO: Initialize dialogue session
    // Mock response for now
    return {
      id: 'greeting',
      text: 'Hello there!',
      choices: []
    };
  }

  async advanceDialogue(npcId: string, characterId: string, choiceId: string): Promise<DialogueNode> {
    // TODO: Process dialogue choice and return next node
    throw new Error('Not implemented');
  }
}
```

## 5. Socket Events

Add to `/packages/server/src/sockets/events/`:

### monster.events.ts
```typescript
export const registerMonsterEvents = (io: Server, socket: Socket) => {
  // Monster spawned in zone
  socket.on('zone:subscribe', (zoneId: string) => {
    socket.join(`zone:${zoneId}`);
  });

  // Emit: monster:spawned, monster:killed, monster:state-changed
};
```

### npc.events.ts
```typescript
export const registerNPCEvents = (io: Server, socket: Socket) => {
  // NPC interaction updates
  socket.on('npc:watch', (npcId: string) => {
    socket.join(`npc:${npcId}`);
  });

  // Emit: npc:dialogue-started, npc:dialogue-updated
};
```

## 6. Test Stubs

Create test files with basic structure:

### /packages/server/src/__tests__/monster.service.test.ts
```typescript
describe('MonsterService', () => {
  describe('spawnMonster', () => {
    it('should spawn a monster at spawn point', async () => {
      // TODO: Implement test
      expect(true).toBe(true);
    });

    it('should emit monster:spawned event', async () => {
      // TODO: Implement test
      expect(true).toBe(true);
    });
  });
});
```

## 7. In-Memory Storage (No Redis)

### /packages/server/src/services/SpawnService.ts
```typescript
export class SpawnService {
  private activeSpawns: Map<string, SpawnTimer> = new Map();

  async scheduleRespawn(spawnPointId: string, delaySeconds: number): Promise<void> {
    // Use setTimeout instead of Redis
    const timer = setTimeout(() => {
      this.handleRespawn(spawnPointId);
    }, delaySeconds * 1000);

    this.activeSpawns.set(spawnPointId, { timer, scheduledAt: Date.now() });
  }
}
```

## Summary of Deliverables

1. **Database Migrations** (5 tables):
   - monsters, monster_types, spawn_points, npcs, npc_interactions

2. **TypeScript Types** (2 files):
   - monster.types.ts, npc.types.ts

3. **API Routes** (2 route files):
   - GET/POST endpoints with mock responses
   - Proper authentication middleware

4. **Service Classes** (4 services):
   - MonsterService, NPCService, SpawnService, DialogueService (all scaffolded)

5. **Socket Events** (2 event files):
   - monster.events.ts, npc.events.ts

6. **Test Stubs**: Basic test structure for each service

## Notes
- All queries use parameterized statements
- Services throw "Not implemented" errors
- Mock data provided for frontend development
- In-memory Maps replace Redis during development
- Follow existing patterns from CharacterService, CombatService