import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, userSessions, auditLog } from '../../database/schema';

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Session types
export type UserSession = InferSelectModel<typeof userSessions>;
export type NewUserSession = InferInsertModel<typeof userSessions>;

// Audit log types
export type AuditLogEntry = InferSelectModel<typeof auditLog>;
export type NewAuditLogEntry = InferInsertModel<typeof auditLog>;

// Enums
export const UserStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;

export const UserRole = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

export const AuditEventType = {
  USER_REGISTER: 'user.register',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  SESSION_CREATE: 'session.create',
  SESSION_REFRESH: 'session.refresh',
  SESSION_REVOKE: 'session.revoke',
} as const;