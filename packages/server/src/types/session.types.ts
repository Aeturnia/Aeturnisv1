export interface Session {
  sessionId: string;
  userId: string;
  createdAt: string;
  lastActive: string;
  metadata: SessionMetadata;
  expiresAt: string;
}

export interface SessionMetadata {
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  platform?: 'ios' | 'android' | 'web';
  gameVersion?: string;
  [key: string]: unknown;
}