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