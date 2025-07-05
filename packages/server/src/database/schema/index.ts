import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, index, uniqueIndex, integer, bigint } from 'drizzle-orm/pg-core';
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
  experience: bigint('experience', { mode: 'bigint' }).notNull(),
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
  bonusStrength: bigint('bonus_strength', { mode: 'bigint' }).notNull(),
  bonusDexterity: bigint('bonus_dexterity', { mode: 'bigint' }).notNull(),
  bonusIntelligence: bigint('bonus_intelligence', { mode: 'bigint' }).notNull(),
  bonusWisdom: bigint('bonus_wisdom', { mode: 'bigint' }).notNull(),
  bonusConstitution: bigint('bonus_constitution', { mode: 'bigint' }).notNull(),
  bonusCharisma: bigint('bonus_charisma', { mode: 'bigint' }).notNull(),
  
  // Progression Systems
  prestigeLevel: integer('prestige_level').notNull().default(0),
  paragonPoints: bigint('paragon_points', { mode: 'bigint' }).notNull(),
  paragonDistribution: jsonb('paragon_distribution').notNull().default({}).$type<ParagonDistribution>(),
  
  // Resource pools
  currentHp: bigint('current_hp', { mode: 'bigint' }).notNull(),
  maxHp: bigint('max_hp', { mode: 'bigint' }).notNull(),
  currentMp: bigint('current_mp', { mode: 'bigint' }).notNull(),
  maxMp: bigint('max_mp', { mode: 'bigint' }).notNull(),
  currentStamina: bigint('current_stamina', { mode: 'bigint' }).notNull(),
  maxStamina: bigint('max_stamina', { mode: 'bigint' }).notNull(),
  
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