export const mockCombatSession = {
  sessionId: 'combat-123',
  participants: [
    {
      id: 'character-123',
      name: 'Test Character',
      type: 'character',
      currentHp: 100,
      maxHp: 100,
      level: 10,
      stats: {
        attack: 50,
        defense: 40,
        speed: 30,
      },
    },
    {
      id: 'monster-456',
      name: 'Test Monster',
      type: 'monster',
      currentHp: 80,
      maxHp: 80,
      level: 8,
      stats: {
        attack: 40,
        defense: 30,
        speed: 25,
      },
    },
  ],
  turnOrder: ['character-123', 'monster-456'],
  currentTurn: 0,
  round: 1,
  status: 'active',
  startedAt: new Date().toISOString(),
};

export const mockCombatStats = {
  characterId: 'character-123',
  attack: 50,
  defense: 40,
  speed: 30,
  criticalChance: 0.1,
  criticalMultiplier: 2,
  accuracy: 0.95,
  evasion: 0.1,
};

export const mockProcessedAction = {
  action: 'attack',
  actorId: 'character-123',
  targetId: 'monster-456',
  damage: 25,
  critical: false,
  hit: true,
  remainingHp: 55,
  effects: [],
  timestamp: new Date().toISOString(),
};

export const mockCharacter = {
  id: 'character-123',
  name: 'Test Character',
  level: 10,
  experience: 5000,
  position: { x: 10, y: 20, z: 0 },
  stats: {
    health: 100,
    mana: 50,
    stamina: 75,
  },
  inventory: [],
  equipment: {},
};

export const mockMonster = {
  id: 'monster-456',
  name: 'Test Monster',
  type: 'goblin',
  level: 8,
  position: { x: 15, y: 20, z: 0 },
  state: 'idle',
  health: 80,
  maxHealth: 80,
  aggroRange: 10,
  lootTableId: 'goblin-loot',
};

export const mockNPC = {
  id: 'npc-789',
  name: 'Test NPC',
  type: 'merchant',
  position: { x: 5, y: 5, z: 0 },
  dialogueId: 'merchant-dialogue',
  services: ['trade', 'repair'],
};

export const mockCurrencyBalance = {
  characterId: 'character-123',
  gold: 100,
  silver: 50,
  copper: 25,
  total: 10525, // in copper
};

export const mockBankData = {
  characterId: 'character-123',
  slots: 20,
  items: [
    {
      slot: 0,
      itemId: 'item-123',
      quantity: 5,
      metadata: {},
    },
  ],
  lastModified: new Date().toISOString(),
};

export const mockLootDrop = {
  itemId: 'item-123',
  quantity: 1,
  rarity: 'common',
  name: 'Test Item',
  value: 10,
};

export const mockDeathStatus = {
  characterId: 'character-123',
  isDead: true,
  deathTime: new Date().toISOString(),
  deathLocation: { x: 10, y: 20, z: 0 },
  deathPenalty: {
    experienceLoss: 500,
    durabilityLoss: 0.1,
  },
  respawnOptions: [
    {
      location: 'nearest-graveyard',
      position: { x: 0, y: 0, z: 0 },
      cost: 0,
    },
    {
      location: 'town',
      position: { x: 100, y: 100, z: 0 },
      cost: 100,
    },
  ],
};

export const mockDialogueNode = {
  id: 'dialogue-node-1',
  npcText: 'Welcome, traveler! How can I help you?',
  options: [
    {
      id: 'option-1',
      text: 'I want to trade',
      nextNodeId: 'trade-node',
      conditions: [],
    },
    {
      id: 'option-2',
      text: 'Tell me about this town',
      nextNodeId: 'info-node',
      conditions: [],
    },
    {
      id: 'option-3',
      text: 'Goodbye',
      nextNodeId: null,
      conditions: [],
    },
  ],
};