import { CacheService } from './CacheService';
import { Session, SessionMetadata } from '../types/session.types';
import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  private cache: CacheService;
  private sessionTTL: number = 30 * 24 * 60 * 60; // 30 days in seconds
  
  constructor(cacheService: CacheService) {
    this.cache = cacheService;
  }

  async createSession(userId: string, metadata: SessionMetadata): Promise<string> {
    const sessionId = uuidv4();
    const session: Session = {
      sessionId,
      userId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      metadata,
      expiresAt: new Date(Date.now() + this.sessionTTL * 1000).toISOString()
    };

    const sessionKey = `session:${sessionId}`;
    const userSessionKey = `user:${userId}:sessions`;
    
    // Store session
    await this.cache.set(sessionKey, session, this.sessionTTL);
    
    // Track user's active sessions
    const userSessions = await this.cache.get<string[]>(userSessionKey) || [];
    userSessions.push(sessionId);
    await this.cache.set(userSessionKey, userSessions, this.sessionTTL);
    
    return sessionId;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const sessionKey = `session:${sessionId}`;
    const session = await this.cache.get<Session>(sessionKey);
    
    if (session) {
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await this.destroySession(sessionId);
        return null;
      }
    }
    
    return session;
  }

  async updateSession(sessionId: string, data: Partial<Session>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      ...session,
      ...data,
      lastActive: new Date().toISOString()
    };

    const sessionKey = `session:${sessionId}`;
    await this.cache.set(sessionKey, updatedSession, this.sessionTTL);
  }

  async extendSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const newExpiresAt = new Date(Date.now() + this.sessionTTL * 1000).toISOString();
    await this.updateSession(sessionId, {
      lastActive: new Date().toISOString(),
      expiresAt: newExpiresAt
    });
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return; // Already gone
    }

    const sessionKey = `session:${sessionId}`;
    const userSessionKey = `user:${session.userId}:sessions`;
    
    // Remove session
    await this.cache.delete(sessionKey);
    
    // Remove from user's session list
    const userSessions = await this.cache.get<string[]>(userSessionKey) || [];
    const filteredSessions = userSessions.filter(id => id !== sessionId);
    
    if (filteredSessions.length > 0) {
      await this.cache.set(userSessionKey, filteredSessions, this.sessionTTL);
    } else {
      await this.cache.delete(userSessionKey);
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    const userSessionKey = `user:${userId}:sessions`;
    const sessionIds = await this.cache.get<string[]>(userSessionKey) || [];
    
    const sessions: Session[] = [];
    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }
    
    return sessions;
  }
}