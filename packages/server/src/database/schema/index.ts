import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, index, uniqueIndex, integer, bigint, serial, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { CharacterRace, CharacterClass, CharacterGender, CharacterAppearance, CharacterPosition, ParagonDistribution } from '../../types/character.types';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  roles: text('roles').array().default(['user']).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
}, (table) => {
  return {
    emailIdx: index('idx_users_email').on(table.email),
    usernameIdx: index('idx_users_username').on(table.username),
    statusIdx: index('idx_users_status').on(table.status),
  };
});

// User sessions table
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refreshTokenJti: varchar('refresh_token_jti', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('idx_sessions_user_id').on(table.userId),
    jtiIdx: uniqueIndex('idx_sessions_jti').on(table.refreshTokenJti),
    expiresIdx: index('idx_sessions_expires').on(table.expiresAt),
  };
});

// Audit log table
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: varchar('resource_id', { length: 255 }),
  payload: jsonb('payload').default({}).$type<Record<string, unknown>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    actorIdx: index('idx_audit_actor').on(table.actorId),
    eventTypeIdx: index('idx_audit_event_type').on(table.eventType),
    createdAtIdx: index('idx_audit_created_at').on(table.createdAt),
  };
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(userSessions),
  auditLogs: many(auditLog),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, {
    fields: [auditLog.actorId],
    references: [users.id],
  }),
}));

// Characters table
export const characters = pgTable('characters', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 32 }).notNull().unique(),
  level: integer('level').notNull().default(1),
  experience: bigint('experience', { mode: 'number' }).notNull().default(0),
  race: varchar('race', { length: 20 }).notNull().$type<CharacterRace>(),
  class: varchar('class', { length: 20 }).notNull().$type<CharacterClass>(),
  gender: varchar('gender', { length: 10 }).notNull().$type<CharacterGender>(),
  
  // Base Stats (1-100 soft cap)
  baseStrength: integer('base_strength').notNull().default(10),
  baseDexterity: integer('base_dexterity').notNull().default(10),
  baseIntelligence: integer('base_intelligence').notNull().default(10),
  baseWisdom: integer('base_wisdom').notNull().default(10),
  baseConstitution: integer('base_constitution').notNull().default(10),
  baseCharisma: integer('base_charisma').notNull().default(10),
  
  // Stat Tiers (0-∞) for infinite progression
  strengthTier: integer('strength_tier').notNull().default(0),
  dexterityTier: integer('dexterity_tier').notNull().default(0),
  intelligenceTier: integer('intelligence_tier').notNull().default(0),
  wisdomTier: integer('wisdom_tier').notNull().default(0),
  constitutionTier: integer('constitution_tier').notNull().default(0),
  charismaTier: integer('charisma_tier').notNull().default(0),
  
  // Bonus Stats (from gear, buffs, etc.)
  bonusStrength: bigint('bonus_strength', { mode: 'number' }).notNull().default(0),
  bonusDexterity: bigint('bonus_dexterity', { mode: 'number' }).notNull().default(0),
  bonusIntelligence: bigint('bonus_intelligence', { mode: 'number' }).notNull().default(0),
  bonusWisdom: bigint('bonus_wisdom', { mode: 'number' }).notNull().default(0),
  bonusConstitution: bigint('bonus_constitution', { mode: 'number' }).notNull().default(0),
  bonusCharisma: bigint('bonus_charisma', { mode: 'number' }).notNull().default(0),
  
  // Progression Systems
  prestigeLevel: integer('prestige_level').notNull().default(0),
  paragonPoints: bigint('paragon_points', { mode: 'number' }).notNull().default(0),
  paragonDistribution: jsonb('paragon_distribution').notNull().default({}).$type<ParagonDistribution>(),
  
  // Resource pools
  currentHp: bigint('current_hp', { mode: 'number' }).notNull().default(100),
  maxHp: bigint('max_hp', { mode: 'number' }).notNull().default(100),
  currentMp: bigint('current_mp', { mode: 'number' }).notNull().default(100),
  maxMp: bigint('max_mp', { mode: 'number' }).notNull().default(100),
  currentStamina: bigint('current_stamina', { mode: 'number' }).notNull().default(100),
  maxStamina: bigint('max_stamina', { mode: 'number' }).notNull().default(100),
  
  // Economy
  gold: bigint('gold', { mode: 'number' }).notNull().default(100),
  bankSlots: integer('bank_slots').notNull().default(20),
  
  // Customization
  appearance: jsonb('appearance').notNull().default({}).$type<CharacterAppearance>(),
  currentZone: varchar('current_zone', { length: 50 }).notNull().default('starter_zone'),
  position: jsonb('position').notNull().default({ x: 0, y: 0, z: 0 }).$type<CharacterPosition>(),
  
  // Death & Respawn System
  isDead: boolean('is_dead').notNull().default(false),
  deathAt: timestamp('death_at', { withTimezone: true }),
  deathCount: integer('death_count').notNull().default(0),
  lastRespawnAt: timestamp('last_respawn_at', { withTimezone: true }),

  // Meta
  isDeleted: boolean('is_deleted').notNull().default(false),
  lastPlayedAt: timestamp('last_played_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    accountDeletedIdx: index('idx_characters_account_deleted').on(table.accountId, table.isDeleted),
    nameIdx: uniqueIndex('idx_characters_name').on(table.name),
    levelIdx: index('idx_characters_level').on(table.level),
    prestigeIdx: index('idx_characters_prestige').on(table.prestigeLevel),
    deathIdx: index('idx_characters_death').on(table.isDead),
  };
});

// Add character relations
export const charactersRelations = relations(characters, ({ one }) => ({
  account: one(users, {
    fields: [characters.accountId],
    references: [users.id],
  }),
}));

// Update users relations to include characters
export const usersRelationsUpdated = relations(users, ({ many }) => ({
  sessions: many(userSessions),
  auditLogs: many(auditLog),
  characters: many(characters),
}));

// Transaction table for tracking all currency movements
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').references(() => characters.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'deposit', 'withdraw', 'transfer', 'purchase', 'sale', 'reward', 'quest', 'trade'
  amount: bigint('amount', { mode: 'number' }).notNull(),
  balanceBefore: bigint('balance_before', { mode: 'number' }).notNull(),
  balanceAfter: bigint('balance_after', { mode: 'number' }).notNull(),
  relatedCharacterId: uuid('related_character_id').references(() => characters.id),
  description: text('description'),
  metadata: jsonb('metadata').$type<TransactionMetadata>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    characterCreatedIdx: index('idx_transaction_char_created').on(table.characterId, table.createdAt),
    typeIdx: index('idx_transaction_type').on(table.type),
    relatedCharIdx: index('idx_transaction_related_char').on(table.relatedCharacterId),
  };
});

// Personal bank storage
export const personalBanks = pgTable('personal_banks', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').references(() => characters.id).notNull(),
  slot: integer('slot').notNull(),
  itemId: integer('item_id'), // Will reference items table when created
  quantity: integer('quantity').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    characterSlotIdx: index('idx_bank_char_slot').on(table.characterId, table.slot),
    characterSlotUnique: uniqueIndex('unique_bank_char_slot').on(table.characterId, table.slot),
  };
});

// Shared bank storage (account-wide)
export const sharedBanks = pgTable('shared_banks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  slot: integer('slot').notNull(),
  itemId: integer('item_id'), // Will reference items table when created
  quantity: integer('quantity').default(1).notNull(),
  lastAccessedBy: uuid('last_accessed_by').references(() => characters.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userSlotIdx: index('idx_shared_bank_user_slot').on(table.userId, table.slot),
    userSlotUnique: uniqueIndex('unique_shared_bank_user_slot').on(table.userId, table.slot),
  };
});

// Currency exchange rates (for future multi-currency support)
export const currencyExchange = pgTable('currency_exchange', {
  id: serial('id').primaryKey(),
  fromCurrency: varchar('from_currency', { length: 10 }).notNull().default('gold'),
  toCurrency: varchar('to_currency', { length: 10 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 4 }).notNull(),
  activeFrom: timestamp('active_from').defaultNow().notNull(),
  activeTo: timestamp('active_to'),
}, (table) => {
  return {
    currencyIdx: index('idx_exchange_currencies').on(table.fromCurrency, table.toCurrency),
    activeIdx: index('idx_exchange_active').on(table.activeFrom, table.activeTo),
  };
});

// Economy table relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  character: one(characters, {
    fields: [transactions.characterId],
    references: [characters.id],
  }),
  relatedCharacter: one(characters, {
    fields: [transactions.relatedCharacterId],
    references: [characters.id],
  }),
}));

// Respawn Points Table
export const respawnPoints = pgTable('respawn_points', {
  id: uuid('id').defaultRandom().primaryKey(),
  zoneId: varchar('zone_id', { length: 50 }).notNull(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  isGraveyard: boolean('is_graveyard').default(false).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  restrictions: jsonb('restrictions').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    zoneIdx: index('idx_respawn_points_zone').on(table.zoneId),
  };
});

// Loot Tables
export const lootTables = pgTable('loot_tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  dropRules: jsonb('drop_rules').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Loot Entries
export const lootEntries = pgTable('loot_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  lootTableId: uuid('loot_table_id').notNull().references(() => lootTables.id, { onDelete: 'cascade' }),
  itemId: varchar('item_id', { length: 255 }).notNull(),
  minQty: integer('min_qty').notNull().default(1),
  maxQty: integer('max_qty').notNull().default(1),
  dropRate: decimal('drop_rate', { precision: 5, scale: 4 }).notNull(),
  rarity: varchar('rarity', { length: 20 }).notNull(),
  conditions: jsonb('conditions').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    lootTableIdx: index('idx_loot_entries_table').on(table.lootTableId),
    rarityIdx: index('idx_loot_entries_rarity').on(table.rarity),
  };
});

// Loot History
export const lootHistory = pgTable('loot_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  combatSessionId: varchar('combat_session_id', { length: 255 }),
  itemId: varchar('item_id', { length: 255 }).notNull(),
  qty: integer('qty').notNull().default(1),
  source: varchar('source', { length: 50 }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    characterIdx: index('idx_loot_history_character').on(table.characterId),
    timestampIdx: index('idx_loot_history_timestamp').on(table.timestamp),
    sourceIdx: index('idx_loot_history_source').on(table.source),
  };
});

// Death, Loot, and Respawn Relations
export const respawnPointsRelations = relations(respawnPoints, ({ many }) => ({
  // Future: respawns: many(characterRespawns),
}));

export const lootTablesRelations = relations(lootTables, ({ many }) => ({
  entries: many(lootEntries),
}));

export const lootEntriesRelations = relations(lootEntries, ({ one }) => ({
  lootTable: one(lootTables, {
    fields: [lootEntries.lootTableId],
    references: [lootTables.id],
  }),
}));

export const lootHistoryRelations = relations(lootHistory, ({ one }) => ({
  character: one(characters, {
    fields: [lootHistory.characterId],
    references: [characters.id],
  }),
}));

export const personalBanksRelations = relations(personalBanks, ({ one }) => ({
  character: one(characters, {
    fields: [personalBanks.characterId],
    references: [characters.id],
  }),
}));

export const sharedBanksRelations = relations(sharedBanks, ({ one }) => ({
  user: one(users, {
    fields: [sharedBanks.userId],
    references: [users.id],
  }),
  lastAccessedByCharacter: one(characters, {
    fields: [sharedBanks.lastAccessedBy],
    references: [characters.id],
  }),
}));

// TypeScript types for economy
export interface TransactionMetadata {
  itemId?: number;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  source?: string;
  destination?: string;
  transferType?: 'send' | 'receive';
  questId?: number;
  npcId?: number;
  shopId?: number;
  tradeId?: string;
}

export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'purchase' | 'sale' | 'reward' | 'quest' | 'trade';
export type CurrencyType = 'gold' | 'silver' | 'copper' | 'premium';

// =============================================================================
// EQUIPMENT & INVENTORY SYSTEM
// =============================================================================

// Items table - Core item definitions
export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  itemType: varchar('item_type', { length: 50 }).notNull(), // 'weapon', 'armor', 'consumable', 'quest', 'misc'
  rarity: varchar('rarity', { length: 20 }).notNull().default('common'), // 'common', 'uncommon', 'rare', 'epic', 'legendary'
  levelRequirement: integer('level_requirement').notNull().default(1),
  equipmentSlot: varchar('equipment_slot', { length: 50 }), // 'head', 'chest', 'weapon', etc. (null for non-equipment)
  maxStack: integer('max_stack').notNull().default(1),
  sellPrice: bigint('sell_price', { mode: 'number' }).notNull().default(0),
  buyPrice: bigint('buy_price', { mode: 'number' }).notNull().default(0),
  bindOnEquip: boolean('bind_on_equip').notNull().default(false),
  bindOnPickup: boolean('bind_on_pickup').notNull().default(false),
  durability: integer('durability').default(100), // null for items without durability
  iconPath: varchar('icon_path', { length: 255 }),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index('idx_items_name').on(table.name),
    typeIdx: index('idx_items_type').on(table.itemType),
    levelIdx: index('idx_items_level').on(table.levelRequirement),
    equipSlotIdx: index('idx_items_equip_slot').on(table.equipmentSlot),
  };
});

// Equipment slots configuration
export const equipmentSlots = pgTable('equipment_slots', {
  id: serial('id').primaryKey(),
  slotType: varchar('slot_type', { length: 50 }).notNull().unique(), // 'head', 'chest', 'weapon', etc.
  displayName: varchar('display_name', { length: 100 }).notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Character equipment - what items are currently equipped
export const characterEquipment = pgTable('character_equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  charId: uuid('char_id').references(() => characters.id, { onDelete: 'cascade' }).notNull(),
  slotType: varchar('slot_type', { length: 50 }).notNull(),
  itemId: integer('item_id').references(() => items.id).notNull(),
  durability: integer('durability').notNull().default(100),
  equippedAt: timestamp('equipped_at').defaultNow().notNull(),
}, (table) => {
  return {
    charSlotIdx: uniqueIndex('idx_char_equip_slot').on(table.charId, table.slotType),
    charIdx: index('idx_char_equipment').on(table.charId),
  };
});

// Character inventory - items in backpack
export const characterInventory = pgTable('character_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  charId: uuid('char_id').references(() => characters.id, { onDelete: 'cascade' }).notNull(),
  itemId: integer('item_id').references(() => items.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  slotPosition: integer('slot_position').notNull(),
  bindStatus: varchar('bind_status', { length: 50 }), // null, 'soulbound', 'account_bound'
  bindTime: timestamp('bind_time'),
  durability: integer('durability'),
  obtainedAt: timestamp('obtained_at').defaultNow().notNull(),
}, (table) => {
  return {
    charSlotIdx: uniqueIndex('idx_char_inventory_slot').on(table.charId, table.slotPosition),
    charIdx: index('idx_char_inventory').on(table.charId),
    itemIdx: index('idx_inventory_item').on(table.itemId),
  };
});

// Item stats - stat bonuses provided by items
export const itemStats = pgTable('item_stats', {
  id: serial('id').primaryKey(),
  itemId: integer('item_id').references(() => items.id, { onDelete: 'cascade' }).notNull(),
  statType: varchar('stat_type', { length: 50 }).notNull(), // 'strength', 'dexterity', 'intelligence', etc.
  value: integer('value').notNull(),
  isPercentage: boolean('is_percentage').default(false).notNull(),
}, (table) => {
  return {
    itemIdx: index('idx_item_stats').on(table.itemId),
    statTypeIdx: index('idx_item_stats_type').on(table.statType),
  };
});

// Item sets - for set bonuses
export const itemSets = pgTable('item_sets', {
  id: serial('id').primaryKey(),
  setName: varchar('set_name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Items that belong to sets
export const itemSetPieces = pgTable('item_set_pieces', {
  id: serial('id').primaryKey(),
  setId: integer('set_id').references(() => itemSets.id, { onDelete: 'cascade' }).notNull(),
  itemId: integer('item_id').references(() => items.id, { onDelete: 'cascade' }).notNull(),
}, (table) => {
  return {
    setIdx: index('idx_set_pieces_set').on(table.setId),
    itemIdx: uniqueIndex('idx_set_pieces_item').on(table.itemId),
  };
});

// Set bonuses - stat bonuses for wearing multiple pieces of a set
export const itemSetBonuses = pgTable('item_set_bonuses', {
  id: serial('id').primaryKey(),
  setId: integer('set_id').references(() => itemSets.id, { onDelete: 'cascade' }).notNull(),
  requiredPieces: integer('required_pieces').notNull(),
  bonusStats: jsonb('bonus_stats').notNull().$type<Record<string, number>>(), // {statType: value, ...}
}, (table) => {
  return {
    setIdx: index('idx_set_bonuses_set').on(table.setId),
    piecesIdx: index('idx_set_bonuses_pieces').on(table.requiredPieces),
  };
});

// Equipment & Inventory Relations
export const itemsRelations = relations(items, ({ many }) => ({
  stats: many(itemStats),
  setPieces: many(itemSetPieces),
  characterEquipment: many(characterEquipment),
  characterInventory: many(characterInventory),
}));

export const itemStatsRelations = relations(itemStats, ({ one }) => ({
  item: one(items, {
    fields: [itemStats.itemId],
    references: [items.id],
  }),
}));

export const characterEquipmentRelations = relations(characterEquipment, ({ one }) => ({
  character: one(characters, {
    fields: [characterEquipment.charId],
    references: [characters.id],
  }),
  item: one(items, {
    fields: [characterEquipment.itemId],
    references: [items.id],
  }),
}));

export const characterInventoryRelations = relations(characterInventory, ({ one }) => ({
  character: one(characters, {
    fields: [characterInventory.charId],
    references: [characters.id],
  }),
  item: one(items, {
    fields: [characterInventory.itemId],
    references: [items.id],
  }),
}));

export const itemSetsRelations = relations(itemSets, ({ many }) => ({
  pieces: many(itemSetPieces),
  bonuses: many(itemSetBonuses),
}));

export const itemSetPiecesRelations = relations(itemSetPieces, ({ one }) => ({
  set: one(itemSets, {
    fields: [itemSetPieces.setId],
    references: [itemSets.id],
  }),
  item: one(items, {
    fields: [itemSetPieces.itemId],
    references: [items.id],
  }),
}));

export const itemSetBonusesRelations = relations(itemSetBonuses, ({ one }) => ({
  set: one(itemSets, {
    fields: [itemSetBonuses.setId],
    references: [itemSets.id],
  }),
}));

// =============================================================================
// MONSTER & NPC SYSTEM
// =============================================================================

// Monster Types table
export const monsterTypes = pgTable('monster_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  level: integer('level').notNull(),
  baseHp: integer('base_hp').notNull(),
  baseAttack: integer('base_attack').notNull(),
  baseDefense: integer('base_defense').notNull(),
  experienceValue: integer('experience_value').notNull(),
  lootTableId: integer('loot_table_id').references(() => lootTables.id),
  aiBehavior: varchar('ai_behavior', { length: 50 }).notNull().default('aggressive'), // aggressive, defensive, neutral
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index('idx_monster_types_name').on(table.name),
    levelIdx: index('idx_monster_types_level').on(table.level),
    behaviorIdx: index('idx_monster_types_behavior').on(table.aiBehavior),
  };
});

// Zones table (referenced by monsters and NPCs)
export const zones = pgTable('zones', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  level: integer('level').notNull().default(1),
  maxPlayers: integer('max_players').notNull().default(100),
  description: text('description'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index('idx_zones_name').on(table.name),
    levelIdx: index('idx_zones_level').on(table.level),
  };
});

// Spawn Points table
export const spawnPoints = pgTable('spawn_points', {
  id: uuid('id').defaultRandom().primaryKey(),
  zoneId: uuid('zone_id').notNull().references(() => zones.id),
  position: jsonb('position').notNull().$type<{x: number, y: number, z: number}>(),
  monsterTypeId: uuid('monster_type_id').notNull().references(() => monsterTypes.id),
  respawnTime: integer('respawn_time').notNull().default(300), // seconds
  maxSpawns: integer('max_spawns').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    zoneIdx: index('idx_spawn_points_zone').on(table.zoneId),
    monsterTypeIdx: index('idx_spawn_points_monster_type').on(table.monsterTypeId),
    activeIdx: index('idx_spawn_points_active').on(table.isActive),
  };
});

// Monsters table
export const monsters = pgTable('monsters', {
  id: uuid('id').defaultRandom().primaryKey(),
  monsterTypeId: uuid('monster_type_id').notNull().references(() => monsterTypes.id),
  zoneId: uuid('zone_id').notNull().references(() => zones.id),
  name: varchar('name', { length: 100 }).notNull(),
  position: jsonb('position').notNull().$type<{x: number, y: number, z: number}>(),
  currentHp: integer('current_hp').notNull(),
  maxHp: integer('max_hp').notNull(),
  state: varchar('state', { length: 20 }).notNull().default('idle'), // idle, patrol, combat, flee
  aggroRadius: integer('aggro_radius').notNull().default(10),
  aggroList: jsonb('aggro_list').notNull().default([]).$type<string[]>(),
  targetId: uuid('target_id'), // current target character_id
  spawnPointId: uuid('spawn_point_id').references(() => spawnPoints.id),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  killedAt: timestamp('killed_at', { withTimezone: true }),
  isDeleted: boolean('is_deleted').notNull().default(false),
}, (table) => {
  return {
    zoneIdx: index('idx_monsters_zone').on(table.zoneId),
    stateIdx: index('idx_monsters_state').on(table.state),
    targetIdx: index('idx_monsters_target').on(table.targetId),
    spawnPointIdx: index('idx_monsters_spawn_point').on(table.spawnPointId),
    deletedIdx: index('idx_monsters_deleted').on(table.isDeleted),
  };
});

// NPCs table
export const npcs = pgTable('npcs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // merchant, quest_giver, guard, trainer, innkeeper
  zoneId: uuid('zone_id').notNull().references(() => zones.id),
  position: jsonb('position').notNull().$type<{x: number, y: number, z: number}>(),
  dialogueTreeId: uuid('dialogue_tree_id'),
  isQuestGiver: boolean('is_quest_giver').notNull().default(false),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
}, (table) => {
  return {
    nameIdx: index('idx_npcs_name').on(table.name),
    typeIdx: index('idx_npcs_type').on(table.type),
    zoneIdx: index('idx_npcs_zone').on(table.zoneId),
    questGiverIdx: index('idx_npcs_quest_giver').on(table.isQuestGiver),
    deletedIdx: index('idx_npcs_deleted').on(table.isDeleted),
  };
});

// NPC Interactions table
export const npcInteractions = pgTable('npc_interactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  npcId: uuid('npc_id').notNull().references(() => npcs.id),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  interactionType: varchar('interaction_type', { length: 50 }).notNull(), // talk, trade, quest_start, quest_complete
  dialogueState: jsonb('dialogue_state').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    npcIdx: index('idx_npc_interactions_npc').on(table.npcId),
    characterIdx: index('idx_npc_interactions_character').on(table.characterId),
    typeIdx: index('idx_npc_interactions_type').on(table.interactionType),
    createdAtIdx: index('idx_npc_interactions_created_at').on(table.createdAt),
  };
});

// Monster & NPC Relations
export const monsterTypesRelations = relations(monsterTypes, ({ many, one }) => ({
  monsters: many(monsters),
  spawnPoints: many(spawnPoints),
  lootTable: one(lootTables, {
    fields: [monsterTypes.lootTableId],
    references: [lootTables.id],
  }),
}));

export const zonesRelations = relations(zones, ({ many }) => ({
  monsters: many(monsters),
  npcs: many(npcs),
  spawnPoints: many(spawnPoints),
}));

export const spawnPointsRelations = relations(spawnPoints, ({ one, many }) => ({
  zone: one(zones, {
    fields: [spawnPoints.zoneId],
    references: [zones.id],
  }),
  monsterType: one(monsterTypes, {
    fields: [spawnPoints.monsterTypeId],
    references: [monsterTypes.id],
  }),
  monsters: many(monsters),
}));

export const monstersRelations = relations(monsters, ({ one }) => ({
  monsterType: one(monsterTypes, {
    fields: [monsters.monsterTypeId],
    references: [monsterTypes.id],
  }),
  zone: one(zones, {
    fields: [monsters.zoneId],
    references: [zones.id],
  }),
  spawnPoint: one(spawnPoints, {
    fields: [monsters.spawnPointId],
    references: [spawnPoints.id],
  }),
  targetCharacter: one(characters, {
    fields: [monsters.targetId],
    references: [characters.id],
  }),
}));

export const npcsRelations = relations(npcs, ({ one, many }) => ({
  zone: one(zones, {
    fields: [npcs.zoneId],
    references: [zones.id],
  }),
  interactions: many(npcInteractions),
}));

export const npcInteractionsRelations = relations(npcInteractions, ({ one }) => ({
  npc: one(npcs, {
    fields: [npcInteractions.npcId],
    references: [npcs.id],
  }),
  character: one(characters, {
    fields: [npcInteractions.characterId],
    references: [characters.id],
  }),
}));

// Update characters relations to include equipment and inventory
export const charactersRelationsUpdated = relations(characters, ({ one, many }) => ({
  account: one(users, {
    fields: [characters.accountId],
    references: [users.id],
  }),
  equipment: many(characterEquipment),
  inventory: many(characterInventory),
  transactions: many(transactions),
  personalBank: many(personalBanks),
}));