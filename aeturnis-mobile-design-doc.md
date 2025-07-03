# Aeturnis Online Mobile-First Design Document for Replit Teams

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Replit Teams Platform Architecture](#replit-teams-platform-architecture)
3. [Custom Authentication System](#custom-authentication-system)
4. [Mobile-First Design Architecture](#mobile-first-design-architecture)
5. [Core Game Systems](#core-game-systems)
6. [Database Architecture](#database-architecture)
7. [API & Real-Time Design](#api-real-time-design)
8. [UI/UX Mobile Implementation](#uiux-mobile-implementation)
9. [Deployment & DevOps Strategy](#deployment-devops-strategy)
10. [Implementation Roadmap](#implementation-roadmap)

## Executive Summary

Aeturnis Online is a text-based MMORPG featuring infinite progression, 8 unique races, weapon/magic affinity systems, and turn-based combat. This document outlines a mobile-first implementation leveraging Replit Teams' enhanced features while implementing a custom authentication system.

### Key Game Features
- **Infinite Progression**: No level cap with exponential scaling
- **8 Playable Races**: Each with unique stats, abilities, and starting zones
- **Affinity System**: Master 7 weapon types and 8 magic schools
- **Turn-Based Combat**: Strategic battles with cooldown management
- **Real-Time Social**: Chat, guilds, and player interactions
- **Mobile-First PWA**: Optimized for touch with offline support

### Replit Teams Advantages
- **Enhanced Compute**: Up to 16 vCPUs and 32 GiB RAM
- **Team Collaboration**: Real-time multiplayer development
- **Enterprise Security**: SOC 2 compliant with SCIM support
- **Advanced Deployments**: Reserved VMs with 99.9% uptime
- **Private Projects**: Enhanced access controls
- **Priority Support**: Dedicated team assistance

## Replit Teams Platform Architecture

### Development Environment Configuration

```yaml
# .replit configuration for Teams
entrypoint = "server/src/index.js"
modules = ["nodejs-20", "nix", "postgresql-15", "redis-7"]

[nix]
channel = "stable-24_05"

[deployment]
deploymentTarget = "reserved-vm"
build = ["npm", "run", "build:production"]
run = ["npm", "run", "start:production"]
ignorePorts = false

[env]
NODE_ENV = "production"
TEAM_ID = "$REPLIT_TEAM_ID"

[[ports]]
localPort = 3000
externalPort = 80

[[ports]]
localPort = 3001
externalPort = 3001
exposeServerRoutes = true

[packager]
language = "nodejs"

[unitTest]
language = "nodejs"
```

### Technology Stack for Teams

```javascript
// Optimized stack for Replit Teams
const techStack = {
  frontend: {
    framework: 'React 18 + TypeScript',
    styling: 'Tailwind CSS + PostCSS',
    state: 'Zustand + React Query',
    realtime: 'Socket.io Client',
    build: 'Vite 5.0',
    testing: 'Vitest + React Testing Library'
  },
  backend: {
    runtime: 'Node.js 20 LTS',
    framework: 'Express + TypeScript',
    database: 'PostgreSQL 15 + Redis',
    auth: 'Custom JWT + Argon2',
    realtime: 'Socket.io + Redis Adapter',
    queue: 'Bull + Redis',
    testing: 'Jest + Supertest'
  },
  deployment: {
    primary: 'Reserved VM (4 vCPU, 8GB RAM)',
    database: 'Managed PostgreSQL',
    cache: 'Redis Cluster',
    cdn: 'Cloudflare',
    monitoring: 'Custom Analytics Dashboard'
  }
};
```

## Custom Authentication System

### JWT-Based Authentication Implementation

```typescript
// auth/authService.ts
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { db } from '../database';
import { redis } from '../cache';

interface AuthConfig {
  jwtSecret: string;
  jwtExpiry: string;
  refreshExpiry: string;
  argon2Options: argon2.Options;
}

export class AuthService {
  private config: AuthConfig;
  
  constructor() {
    this.config = {
      jwtSecret: process.env.JWT_SECRET || randomBytes(32).toString('hex'),
      jwtExpiry: '15m',
      refreshExpiry: '7d',
      argon2Options: {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      }
    };
  }

  async register(email: string, password: string, username: string) {
    // Validate input
    this.validateEmail(email);
    this.validatePassword(password);
    this.validateUsername(username);

    // Check if user exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (existing.rows.length > 0) {
      throw new Error('Email or username already taken');
    }

    // Hash password
    const passwordHash = await argon2.hash(password, this.config.argon2Options);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, username, password_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, email, username`,
      [email, username, passwordHash]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      accessToken,
      refreshToken
    };
  }

  async login(emailOrUsername: string, password: string) {
    // Find user
    const result = await db.query(
      `SELECT id, email, username, password_hash, status
       FROM users 
       WHERE email = $1 OR username = $1`,
      [emailOrUsername]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Check account status
    if (user.status === 'banned') {
      throw new Error('Account banned');
    }

    // Verify password
    const valid = await argon2.verify(user.password_hash, password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      accessToken,
      refreshToken
    };
  }

  async generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      this.config.jwtSecret,
      { expiresIn: this.config.jwtExpiry }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.config.jwtSecret,
      { expiresIn: this.config.refreshExpiry }
    );

    // Store refresh token in Redis
    await redis.setex(
      `refresh:${userId}`,
      7 * 24 * 60 * 60, // 7 days
      refreshToken
    );

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as any;
      
      // Additional validation for refresh tokens
      if (decoded.type === 'refresh') {
        const stored = await redis.get(`refresh:${decoded.userId}`);
        if (stored !== token) {
          throw new Error('Invalid refresh token');
        }
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async refreshAccessToken(refreshToken: string) {
    const decoded = await this.verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, type: 'access' },
      this.config.jwtSecret,
      { expiresIn: this.config.jwtExpiry }
    );

    return { accessToken };
  }

  async logout(userId: string) {
    // Remove refresh token
    await redis.del(`refresh:${userId}`);
    
    // Add access token to blacklist (optional)
    // This prevents token reuse until expiry
  }

  // Validation methods
  private validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  private validatePassword(password: string) {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain number');
    }
  }

  private validateUsername(username: string) {
    if (username.length < 3 || username.length > 20) {
      throw new Error('Username must be 3-20 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
  }
}

// Middleware
export const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const authService = new AuthService();
    const decoded = await authService.verifyToken(token);
    
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Attach user to request
    req.userId = decoded.userId;
    req.user = await getUserById(decoded.userId);
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Session Management

```typescript
// auth/sessionManager.ts
export class SessionManager {
  private redis: Redis;
  private sessionTimeout = 30 * 60; // 30 minutes

  async createSession(userId: string, metadata: any) {
    const sessionId = randomBytes(32).toString('hex');
    const sessionData = {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ...metadata
    };

    await this.redis.setex(
      `session:${sessionId}`,
      this.sessionTimeout,
      JSON.stringify(sessionData)
    );

    return sessionId;
  }

  async validateSession(sessionId: string) {
    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) return null;

    const session = JSON.parse(data);
    
    // Update last activity
    session.lastActivity = Date.now();
    await this.redis.setex(
      `session:${sessionId}`,
      this.sessionTimeout,
      JSON.stringify(session)
    );

    return session;
  }

  async destroySession(sessionId: string) {
    await this.redis.del(`session:${sessionId}`);
  }
}
```

## Mobile-First Design Architecture

### Responsive Component System

```typescript
// components/MobileLayout.tsx
import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [activePanel, setActivePanel] = useState('game');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const panels = ['inventory', 'game', 'chat'];
  
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = panels.indexOf(activePanel);
      if (currentIndex < panels.length - 1) {
        setActivePanel(panels[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const currentIndex = panels.indexOf(activePanel);
      if (currentIndex > 0) {
        setActivePanel(panels[currentIndex - 1]);
      }
    },
    trackMouse: false
  });

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Status Bar */}
      <StatusBar />
      
      {/* Main Content */}
      <main 
        className="flex-1 overflow-hidden relative"
        {...(isMobile ? swipeHandlers : {})}
      >
        {isMobile ? (
          <MobilePanelView activePanel={activePanel}>
            {children}
          </MobilePanelView>
        ) : isTablet ? (
          <TabletSplitView activePanel={activePanel}>
            {children}
          </TabletSplitView>
        ) : (
          <DesktopView>
            {children}
          </DesktopView>
        )}
      </main>
      
      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <BottomNavigation 
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />
      )}
    </div>
  );
};

// Touch-optimized components
export const TouchButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}> = ({ onPress, children, variant = 'primary', size = 'medium' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    small: 'min-h-[36px] px-3 text-sm',
    medium: 'min-h-[44px] px-4 text-base',
    large: 'min-h-[52px] px-6 text-lg'
  };

  const variantClasses = {
    primary: 'bg-green-600 active:bg-green-700',
    secondary: 'bg-blue-600 active:bg-blue-700',
    danger: 'bg-red-600 active:bg-red-700'
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isPressed ? 'scale-95' : 'scale-100'}
        text-white font-medium rounded-lg
        transition-all duration-150
        select-none touch-manipulation
        flex items-center justify-center
      `}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => {
        setIsPressed(false);
        onPress();
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => {
        setIsPressed(false);
        onPress();
      }}
    >
      {children}
    </button>
  );
};
```

### PWA Configuration

```javascript
// public/service-worker.js
const CACHE_NAME = 'aeturnis-v1';
const STATIC_CACHE = 'aeturnis-static-v1';
const DYNAMIC_CACHE = 'aeturnis-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/css/app.css',
  '/js/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy - Network First, Cache Fallback
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    // API calls - Network first with cache fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Static assets - Cache first
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
        .catch(() => {
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        })
    );
  }
});

// Background Sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-game-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  const cache = await caches.open('offline-actions');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.log('Sync failed, will retry');
    }
  }
}
```

## Core Game Systems

### 1. Character Progression System

```typescript
// systems/ProgressionSystem.ts
export class ProgressionSystem {
  private readonly baseExp = 100n;
  private readonly scalingFactor = 1.15;

  calculateExpForLevel(level: number): bigint {
    if (level <= 1) return 0n;
    return this.baseExp * BigInt(Math.floor(Math.pow(this.scalingFactor, level - 1)));
  }

  calculateTotalExpForLevel(level: number): bigint {
    let total = 0n;
    for (let i = 1; i < level; i++) {
      total += this.calculateExpForLevel(i);
    }
    return total;
  }

  getProgressionPhase(level: number): ProgressionPhase {
    const phases: Array<[number, ProgressionPhase]> = [
      [25, { name: 'Novice', color: '#gray', bonusMultiplier: 1.0 }],
      [50, { name: 'Apprentice', color: '#green', bonusMultiplier: 1.1 }],
      [100, { name: 'Journeyman', color: '#blue', bonusMultiplier: 1.25 }],
      [200, { name: 'Expert', color: '#purple', bonusMultiplier: 1.5 }],
      [500, { name: 'Master', color: '#orange', bonusMultiplier: 2.0 }],
      [1000, { name: 'Grandmaster', color: '#red', bonusMultiplier: 3.0 }],
      [Infinity, { name: 'Legendary', color: '#gold', bonusMultiplier: 5.0 }]
    ];

    return phases.find(([threshold]) => level <= threshold)![1];
  }

  async awardExperience(characterId: string, amount: bigint, source: string) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Get character with race bonuses
      const charResult = await client.query(`
        SELECT c.*, r.experience_bonus
        FROM characters c
        JOIN races r ON c.race_id = r.id
        WHERE c.id = $1
        FOR UPDATE
      `, [characterId]);

      if (charResult.rows.length === 0) {
        throw new Error('Character not found');
      }

      const character = charResult.rows[0];
      const raceBonus = 1 + (character.experience_bonus || 0);
      const phaseBonus = this.getProgressionPhase(character.level).bonusMultiplier;
      
      // Calculate final experience
      const finalExp = amount * BigInt(Math.floor(raceBonus * phaseBonus * 100)) / 100n;
      const newTotalExp = BigInt(character.experience) + finalExp;

      // Calculate new level
      let newLevel = character.level;
      while (this.calculateTotalExpForLevel(newLevel + 1) <= newTotalExp) {
        newLevel++;
      }

      // Update character
      await client.query(`
        UPDATE characters 
        SET experience = $1, level = $2, last_active = NOW()
        WHERE id = $3
      `, [newTotalExp.toString(), newLevel, characterId]);

      // Log experience gain
      await client.query(`
        INSERT INTO experience_log (character_id, amount, source, timestamp)
        VALUES ($1, $2, $3, NOW())
      `, [characterId, finalExp.toString(), source]);

      // Check for level up rewards
      if (newLevel > character.level) {
        await this.awardLevelUpRewards(characterId, character.level, newLevel);
      }

      await client.query('COMMIT');

      return {
        experienceGained: finalExp,
        totalExperience: newTotalExp,
        previousLevel: character.level,
        newLevel,
        leveledUp: newLevel > character.level
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

### 2. Turn-Based Combat System

```typescript
// systems/CombatSystem.ts
interface CombatParticipant {
  id: string;
  type: 'player' | 'monster';
  stats: CombatStats;
  health: number;
  maxHealth: number;
  cooldowns: Map<string, number>;
}

export class CombatSystem {
  private activeSessions = new Map<string, CombatSession>();
  private io: Server;
  
  constructor(io: Server) {
    this.io = io;
  }

  async initiateCombat(attackerId: string, targetId: string, targetType: 'player' | 'monster') {
    // Validate combat eligibility
    await this.validateCombatEligibility(attackerId, targetId);

    // Create session
    const sessionId = generateId();
    const attacker = await this.loadCombatant(attackerId, 'player');
    const defender = await this.loadCombatant(targetId, targetType);

    const session: CombatSession = {
      id: sessionId,
      participants: [attacker, defender],
      turnOrder: this.calculateInitiative([attacker, defender]),
      currentTurn: 0,
      turnTimer: null,
      combatLog: [],
      startedAt: Date.now()
    };

    this.activeSessions.set(sessionId, session);

    // Join socket rooms
    this.io.to(attackerId).socketsJoin(`combat:${sessionId}`);
    if (targetType === 'player') {
      this.io.to(targetId).socketsJoin(`combat:${sessionId}`);
    }

    // Start turn timer
    this.startTurnTimer(sessionId);

    // Emit combat start
    this.io.to(`combat:${sessionId}`).emit('combat:started', {
      sessionId,
      participants: session.participants.map(p => ({
        id: p.id,
        type: p.type,
        health: p.health,
        maxHealth: p.maxHealth
      })),
      turnOrder: session.turnOrder,
      currentTurn: session.turnOrder[0]
    });

    return session;
  }

  async executeAction(sessionId: string, actorId: string, action: CombatAction) {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Invalid combat session');

    // Validate turn
    const currentActor = session.turnOrder[session.currentTurn];
    if (currentActor !== actorId) {
      throw new Error('Not your turn');
    }

    // Validate cooldown
    const actor = session.participants.find(p => p.id === actorId)!;
    const cooldown = actor.cooldowns.get(action.type) || 0;
    if (cooldown > 0) {
      throw new Error(`Ability on cooldown: ${cooldown} turns remaining`);
    }

    // Execute action
    const result = await this.processAction(session, actor, action);
    
    // Update cooldowns
    this.updateCooldowns(session);
    
    // Add to combat log
    session.combatLog.push({
      turn: session.currentTurn,
      actor: actorId,
      action: action.type,
      result,
      timestamp: Date.now()
    });

    // Check for combat end
    const defeated = session.participants.find(p => p.health <= 0);
    if (defeated) {
      await this.endCombat(sessionId, defeated.id === actorId ? 
        session.participants.find(p => p.id !== actorId)!.id : actorId);
      return;
    }

    // Advance turn
    session.currentTurn = (session.currentTurn + 1) % session.turnOrder.length;
    this.startTurnTimer(sessionId);

    // Broadcast update
    this.io.to(`combat:${sessionId}`).emit('combat:action', {
      actor: actorId,
      action: action.type,
      result,
      nextTurn: session.turnOrder[session.currentTurn],
      participants: session.participants.map(p => ({
        id: p.id,
        health: p.health,
        cooldowns: Array.from(p.cooldowns.entries())
      }))
    });
  }

  private async processAction(session: CombatSession, actor: CombatParticipant, action: CombatAction) {
    const target = session.participants.find(p => p.id !== actor.id)!;
    
    switch (action.type) {
      case 'attack':
        return this.processAttack(actor, target, action.weaponType);
      
      case 'ability':
        return this.processAbility(actor, target, action.abilityId);
      
      case 'defend':
        return this.processDefend(actor);
      
      case 'flee':
        return this.processFlee(session, actor);
      
      default:
        throw new Error('Invalid action type');
    }
  }

  private async processAttack(actor: CombatParticipant, target: CombatParticipant, weaponType?: string) {
    // Base damage calculation
    let damage = actor.stats.strength + Math.floor(Math.random() * 10);
    
    // Apply weapon affinity bonus
    if (weaponType) {
      const affinity = await this.getWeaponAffinity(actor.id, weaponType);
      damage = Math.floor(damage * this.getAffinityMultiplier(affinity));
    }
    
    // Apply defense
    damage = Math.max(1, damage - target.stats.defense);
    
    // Critical hit chance
    const critChance = 5 + (actor.stats.dexterity / 10);
    const isCritical = Math.random() * 100 < critChance;
    if (isCritical) {
      damage *= 2;
    }
    
    // Apply damage
    target.health = Math.max(0, target.health - damage);
    
    // Update weapon affinity
    if (weaponType && actor.type === 'player') {
      await this.updateWeaponAffinity(actor.id, weaponType);
    }
    
    return {
      type: 'damage',
      amount: damage,
      isCritical,
      targetHealth: target.health
    };
  }

  private startTurnTimer(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Clear existing timer
    if (session.turnTimer) {
      clearTimeout(session.turnTimer);
    }

    // Set new timer (30 seconds)
    session.turnTimer = setTimeout(() => {
      this.autoEndTurn(sessionId);
    }, 30000);
  }

  private async autoEndTurn(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const currentActor = session.turnOrder[session.currentTurn];
    
    // Auto-defend
    await this.executeAction(sessionId, currentActor, { type: 'defend' });
  }
}
```

### 3. Affinity System

```typescript
// systems/AffinitySystem.ts
export class AffinitySystem {
  private weaponTypes = ['sword', 'axe', 'mace', 'dagger', 'staff', 'bow', 'unarmed'];
  private magicSchools = ['fire', 'ice', 'lightning', 'earth', 'holy', 'dark', 'arcane', 'nature'];

  async updateAffinity(characterId: string, type: 'weapon' | 'magic', category: string) {
    const baseGain = type === 'weapon' ? 0.1 : 0.05;
    
    // Get current affinity
    const result = await db.query(`
      SELECT level, uses FROM character_affinities
      WHERE character_id = $1 AND type = $2 AND category = $3
    `, [characterId, type, category]);

    let currentLevel = 0;
    let totalUses = 0;

    if (result.rows.length > 0) {
      currentLevel = parseFloat(result.rows[0].level);
      totalUses = parseInt(result.rows[0].uses);
    }

    // Calculate gain with diminishing returns
    const diminishingFactor = Math.max(0.1, 1 - (currentLevel / 150));
    const gain = baseGain * diminishingFactor;
    const newLevel = Math.min(100, currentLevel + gain);

    // Update database
    await db.query(`
      INSERT INTO character_affinities (character_id, type, category, level, uses, last_used)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (character_id, type, category)
      DO UPDATE SET 
        level = $4,
        uses = character_affinities.uses + 1,
        last_used = NOW()
    `, [characterId, type, category, newLevel, totalUses + 1]);

    // Check for milestones
    await this.checkMilestones(characterId, type, category, currentLevel, newLevel);

    return {
      type,
      category,
      previousLevel: currentLevel,
      newLevel,
      gain
    };
  }

  getAffinityMultiplier(level: number): number {
    if (level < 25) return 1.0;
    if (level < 50) return 1.1;
    if (level < 75) return 1.25;
    if (level < 100) return 1.4;
    return 1.6;
  }

  async checkMilestones(characterId: string, type: string, category: string, oldLevel: number, newLevel: number) {
    const milestones = [25, 50, 75, 100];
    
    for (const milestone of milestones) {
      if (oldLevel < milestone && newLevel >= milestone) {
        await this.awardMilestoneReward(characterId, type, category, milestone);
      }
    }
  }

  private async awardMilestoneReward(characterId: string, type: string, category: string, milestone: number) {
    // Log achievement
    await db.query(`
      INSERT INTO character_achievements (character_id, achievement_type, details, earned_at)
      VALUES ($1, 'affinity_milestone', $2, NOW())
    `, [characterId, JSON.stringify({ type, category, milestone })]);

    // Award title
    const titles: Record<number, string> = {
      25: 'Novice',
      50: 'Adept',
      75: 'Expert',
      100: 'Master'
    };

    const title = `${titles[milestone]} of ${category}`;
    
    await db.query(`
      INSERT INTO character_titles (character_id, title, earned_at)
      VALUES ($1, $2, NOW())
    `, [characterId, title]);
  }
}
```

## Database Architecture

### Complete Schema Design

```sql
-- Users table (custom auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Races table
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  stat_modifiers JSONB NOT NULL,
  experience_bonus DECIMAL(3,2) DEFAULT 0,
  weapon_affinity_bonus DECIMAL(3,2) DEFAULT 0,
  magic_affinity_bonus DECIMAL(3,2) DEFAULT 0,
  special_abilities JSONB DEFAULT '[]',
  starting_zone VARCHAR(100) NOT NULL
);

-- Characters table
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  race_id UUID REFERENCES races(id),
  name VARCHAR(50) UNIQUE NOT NULL,
  level INTEGER DEFAULT 1,
  experience NUMERIC(40,0) DEFAULT 0,
  health INTEGER NOT NULL,
  max_health INTEGER NOT NULL,
  mana INTEGER NOT NULL,
  max_mana INTEGER NOT NULL,
  stats JSONB NOT NULL,
  location JSONB DEFAULT '{"zone": "tutorial", "x": 0, "y": 0}',
  inventory_slots INTEGER DEFAULT 20,
  bank_slots INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_characters_user ON characters(user_id);
CREATE INDEX idx_characters_active ON characters(last_active);

-- Character affinities
CREATE TABLE character_affinities (
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('weapon', 'magic')),
  category VARCHAR(50) NOT NULL,
  level DECIMAL(5,2) DEFAULT 0,
  uses INTEGER DEFAULT 0,
  last_used TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (character_id, type, category)
);

CREATE INDEX idx_affinities_character ON character_affinities(character_id);

-- Items and inventory
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  subtype VARCHAR(50),
  rarity VARCHAR(20) DEFAULT 'common',
  level_requirement INTEGER DEFAULT 1,
  stats JSONB DEFAULT '{}',
  effects JSONB DEFAULT '[]',
  tradeable BOOLEAN DEFAULT true,
  stackable BOOLEAN DEFAULT false,
  max_stack INTEGER DEFAULT 1
);

CREATE TABLE character_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  quantity INTEGER DEFAULT 1,
  slot_position INTEGER,
  equipped BOOLEAN DEFAULT false,
  bound BOOLEAN DEFAULT false,
  obtained_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inventory_character ON character_inventory(character_id);

-- Combat system tables
CREATE TABLE combat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID REFERENCES characters(id),
  defender_id UUID,
  defender_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  winner_id UUID,
  combat_log JSONB DEFAULT '[]'
);

CREATE INDEX idx_combat_active ON combat_sessions(status) WHERE status = 'active';

-- Social features
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  tag VARCHAR(5) UNIQUE NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES characters(id),
  level INTEGER DEFAULT 1,
  experience NUMERIC(20,0) DEFAULT 0,
  member_limit INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE guild_members (
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  rank VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (guild_id, character_id)
);

-- Chat system
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type VARCHAR(20) NOT NULL,
  channel_id VARCHAR(100),
  sender_id UUID REFERENCES characters(id),
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_channel ON chat_messages(channel_type, channel_id, timestamp DESC);

-- Achievements and progression
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  points INTEGER DEFAULT 10,
  requirements JSONB NOT NULL,
  rewards JSONB DEFAULT '{}'
);

CREATE TABLE character_achievements (
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (character_id, achievement_id)
);
```

### Redis Cache Schema

```typescript
// cache/schemas.ts
export const cacheSchemas = {
  // User sessions
  'session:{sessionId}': {
    userId: 'string',
    characterId: 'string',
    lastActivity: 'timestamp',
    metadata: 'object'
  },
  
  // Character data cache
  'character:{characterId}': {
    ttl: 300, // 5 minutes
    data: 'full character object'
  },
  
  // Combat session data
  'combat:{sessionId}': {
    ttl: 3600, // 1 hour
    data: 'combat session state'
  },
  
  // Rate limiting
  'ratelimit:{userId}:{action}': {
    ttl: 60,
    count: 'number'
  },
  
  // Online status
  'online:{characterId}': {
    ttl: 300,
    zone: 'string',
    status: 'string'
  },
  
  // Leaderboard caches
  'leaderboard:{type}': {
    ttl: 300,
    data: 'sorted rankings'
  }
};
```

## API & Real-Time Design

### RESTful API Structure

```typescript
// server/src/app.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';

// Initialize Express
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true
  },
  adapter: createAdapter(redis)
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ credentials: true }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', authMiddleware, characterRoutes);
app.use('/api/game', authMiddleware, gameRoutes);
app.use('/api/combat', authMiddleware, combatRoutes);
app.use('/api/social', authMiddleware, socialRoutes);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);

// Socket.io connection handling
io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join user room
  socket.join(`user:${socket.userId}`);
  
  // Handle character selection
  socket.on('character:select', async (characterId) => {
    try {
      const character = await characterService.getCharacter(characterId);
      if (character.user_id !== socket.userId) {
        throw new Error('Unauthorized');
      }
      
      socket.characterId = characterId;
      socket.join(`character:${characterId}`);
      socket.join(`zone:${character.location.zone}`);
      
      // Update online status
      await redis.setex(`online:${characterId}`, 300, JSON.stringify({
        zone: character.location.zone,
        status: 'online'
      }));
      
      socket.emit('character:selected', character);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle chat messages
  socket.on('chat:send', async (data) => {
    try {
      const message = await chatService.sendMessage(
        socket.characterId,
        data.channel,
        data.message
      );
      
      // Broadcast to appropriate channel
      const room = data.channel === 'global' ? 'global' : `zone:${data.channel}`;
      io.to(room).emit('chat:message', message);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle combat actions
  socket.on('combat:action', async (data) => {
    try {
      await combatSystem.executeAction(
        data.sessionId,
        socket.characterId,
        data.action
      );
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', async () => {
    if (socket.characterId) {
      await redis.del(`online:${socket.characterId}`);
      io.emit('player:offline', socket.characterId);
    }
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Aeturnis Online server running on port ${PORT}`);
});
```

### API Route Examples

```typescript
// routes/gameRoutes.ts
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// Movement
router.post('/move',
  body('direction').isIn(['north', 'south', 'east', 'west']),
  validate,
  async (req, res) => {
    try {
      const result = await gameService.moveCharacter(
        req.user.characterId,
        req.body.direction
      );
      
      // Broadcast movement to zone
      req.io.to(`zone:${result.previousZone}`).emit('player:left', {
        characterId: req.user.characterId
      });
      
      req.io.to(`zone:${result.newZone}`).emit('player:entered', {
        characterId: req.user.characterId,
        location: result.location
      });
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Zone information
router.get('/zone/:zoneName',
  param('zoneName').isString(),
  validate,
  async (req, res) => {
    try {
      const zone = await gameService.getZoneInfo(req.params.zoneName);
      const players = await gameService.getPlayersInZone(req.params.zoneName);
      const npcs = await gameService.getNPCsInZone(req.params.zoneName);
      
      res.json({
        zone,
        players,
        npcs,
        canPvP: zone.pvp_enabled
      });
    } catch (error) {
      res.status(404).json({ error: 'Zone not found' });
    }
  }
);

// Use ability
router.post('/ability/:abilityId/use',
  param('abilityId').isUUID(),
  body('targetId').optional().isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await abilityService.useAbility(
        req.user.characterId,
        req.params.abilityId,
        req.body.targetId
      );
      
      // Broadcast ability effect
      req.io.to(`zone:${req.user.location.zone}`).emit('ability:used', {
        caster: req.user.characterId,
        ability: req.params.abilityId,
        target: req.body.targetId,
        effects: result.effects
      });
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
```

## UI/UX Mobile Implementation

### Mobile Game Interface

```typescript
// components/GameInterface.tsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../hooks/useGame';
import { useSwipeable } from 'react-swipeable';

export const GameInterface: React.FC = () => {
  const socket = useSocket();
  const game = useGame();
  const [activePanel, setActivePanel] = useState<'game' | 'combat' | 'inventory' | 'chat'>('game');

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigatePanel('next'),
    onSwipedRight: () => navigatePanel('prev'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  const navigatePanel = (direction: 'next' | 'prev') => {
    const panels = ['game', 'combat', 'inventory', 'chat'];
    const currentIndex = panels.indexOf(activePanel);
    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % panels.length
      : (currentIndex - 1 + panels.length) % panels.length;
    setActivePanel(panels[nextIndex] as any);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Status Bar */}
      <div className="bg-gray-800 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm">Lv.{game.character?.level}</span>
          <div className="bg-green-600 h-2 w-20 rounded">
            <div 
              className="bg-green-400 h-full rounded"
              style={{ width: `${game.character?.healthPercent}%` }}
            />
          </div>
        </div>
        <div className="text-sm">
          {game.character?.location.zone}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden" {...swipeHandlers}>
        {activePanel === 'game' && <GamePanel />}
        {activePanel === 'combat' && <CombatPanel />}
        {activePanel === 'inventory' && <InventoryPanel />}
        {activePanel === 'chat' && <ChatPanel />}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activePanel={activePanel} onPanelChange={setActivePanel} />
    </div>
  );
};

// Game Panel Component
const GamePanel: React.FC = () => {
  const game = useGame();
  const [textHistory, setTextHistory] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to game events
    const unsubscribe = game.on('text', (text: string) => {
      setTextHistory(prev => [...prev.slice(-50), text]);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Game Text Display */}
      <div className="flex-1 overflow-y-auto mb-4 bg-gray-800 rounded p-3">
        {textHistory.map((text, index) => (
          <p key={index} className="mb-2 text-sm">
            {text}
          </p>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <TouchButton onPress={() => game.move('north')}>
          North ↑
        </TouchButton>
        <TouchButton onPress={() => game.move('south')}>
          South ↓
        </TouchButton>
        <TouchButton onPress={() => game.move('west')}>
          West ←
        </TouchButton>
        <TouchButton onPress={() => game.move('east')}>
          East →
        </TouchButton>
      </div>

      {/* Context Actions */}
      <div className="mt-4 flex space-x-2">
        <TouchButton 
          variant="primary" 
          onPress={() => game.interact()}
          size="small"
        >
          Interact
        </TouchButton>
        <TouchButton 
          variant="secondary"
          onPress={() => game.examine()}
          size="small"
        >
          Examine
        </TouchButton>
      </div>
    </div>
  );
};

// Combat Panel Component
const CombatPanel: React.FC = () => {
  const { combat } = useGame();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  if (!combat.inCombat) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-400">Not in combat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Enemy Display */}
      <div className="bg-gray-800 rounded p-4 mb-4">
        <h3 className="font-bold mb-2">{combat.enemy?.name}</h3>
        <div className="bg-red-900 h-3 rounded">
          <div 
            className="bg-red-600 h-full rounded transition-all duration-300"
            style={{ width: `${combat.enemy?.healthPercent}%` }}
          />
        </div>
        <p className="text-sm mt-1">
          {combat.enemy?.health} / {combat.enemy?.maxHealth} HP
        </p>
      </div>

      {/* Combat Log */}
      <div className="flex-1 overflow-y-auto bg-gray-800 rounded p-3 mb-4">
        {combat.log.map((entry, index) => (
          <p key={index} className="text-sm mb-1">
            {entry.text}
          </p>
        ))}
      </div>

      {/* Combat Actions */}
      <div className="grid grid-cols-2 gap-2">
        <CombatActionButton
          action="attack"
          cooldown={combat.cooldowns.attack}
          onPress={() => combat.executeAction('attack')}
        >
          ⚔️ Attack
        </CombatActionButton>
        <CombatActionButton
          action="defend"
          cooldown={combat.cooldowns.defend}
          onPress={() => combat.executeAction('defend')}
        >
          🛡️ Defend
        </CombatActionButton>
        <CombatActionButton
          action="ability"
          cooldown={combat.cooldowns.ability}
          onPress={() => setSelectedAction('ability')}
        >
          ✨ Ability
        </CombatActionButton>
        <CombatActionButton
          action="flee"
          cooldown={combat.cooldowns.flee}
          onPress={() => combat.executeAction('flee')}
        >
          🏃 Flee
        </CombatActionButton>
      </div>
    </div>
  );
};

// Inventory Panel Component  
const InventoryPanel: React.FC = () => {
  const { inventory } = useGame();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-xl font-bold mb-4">Inventory</h2>
      
      {/* Item Grid */}
      <div className="grid grid-cols-5 gap-2 flex-1 overflow-y-auto">
        {inventory.items.map((item, index) => (
          <InventorySlot
            key={item.id || index}
            item={item}
            selected={selectedItem === item.id}
            onPress={() => setSelectedItem(item.id)}
          />
        ))}
      </div>

      {/* Item Actions */}
      {selectedItem && (
        <div className="mt-4 flex space-x-2">
          <TouchButton size="small" onPress={() => inventory.useItem(selectedItem)}>
            Use
          </TouchButton>
          <TouchButton size="small" variant="secondary" onPress={() => inventory.equipItem(selectedItem)}>
            Equip
          </TouchButton>
          <TouchButton size="small" variant="danger" onPress={() => inventory.dropItem(selectedItem)}>
            Drop
          </TouchButton>
        </div>
      )}
    </div>
  );
};
```

### Mobile-Optimized Styles

```css
/* styles/mobile.css */
@layer components {
  /* Touch-optimized buttons */
  .touch-button {
    @apply min-h-[44px] px-4 flex items-center justify-center;
    @apply rounded-lg font-medium transition-all duration-150;
    @apply select-none touch-manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .touch-button:active {
    @apply scale-95;
  }

  /* Swipeable panels */
  .swipe-panel {
    @apply transition-transform duration-300 ease-out;
  }

  /* Mobile-friendly text */
  .game-text {
    @apply text-sm leading-relaxed;
    word-break: break-word;
    -webkit-hyphens: auto;
    hyphens: auto;
  }

  /* Touch-friendly lists */
  .touch-list-item {
    @apply min-h-[48px] px-4 py-3 flex items-center;
    @apply border-b border-gray-700 transition-colors;
  }

  .touch-list-item:active {
    @apply bg-gray-800;
  }

  /* Safe area padding for notched devices */
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .safe-left {
    padding-left: env(safe-area-inset-left);
  }

  .safe-right {
    padding-right: env(safe-area-inset-right);
  }
}

/* Responsive utilities */
@media (hover: hover) and (pointer: fine) {
  .touch-button:hover {
    @apply brightness-110;
  }
}

/* Landscape adjustments */
@media (orientation: landscape) and (max-height: 500px) {
  .bottom-nav {
    @apply hidden;
  }
  
  .game-content {
    @apply pb-0;
  }
}
```

## Deployment & DevOps Strategy

### Replit Teams Deployment Configuration

```yaml
# deployment.yml
production:
  type: reserved-vm
  machine: large # 4 vCPU, 8GB RAM
  region: us-central
  scaling:
    min: 1
    max: 1
  
staging:
  type: autoscale
  machine: medium # 2 vCPU, 4GB RAM
  scaling:
    min: 1
    max: 3
    target_cpu: 70
    target_memory: 80

development:
  type: development
  machine: small # 0.5 vCPU, 2GB RAM
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Replit

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint
      
      - name: Build application
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Replit
        env:
          REPLIT_TOKEN: ${{ secrets.REPLIT_TOKEN }}
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            npm run deploy:production
          else
            npm run deploy:staging
          fi
```

### Monitoring and Analytics

```typescript
// monitoring/gameAnalytics.ts
export class GameAnalytics {
  private events: AnalyticsEvent[] = [];
  
  async trackEvent(event: AnalyticsEvent) {
    // Batch events
    this.events.push(event);
    
    if (this.events.length >= 100) {
      await this.flush();
    }
  }

  async trackPlayerAction(playerId: string, action: string, metadata?: any) {
    await this.trackEvent({
      type: 'player_action',
      playerId,
      action,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  async trackPerformance(metric: string, value: number) {
    await this.trackEvent({
      type: 'performance',
      metric,
      value,
      timestamp: new Date().toISOString()
    });
  }

  private async flush() {
    if (this.events.length === 0) return;
    
    const events = [...this.events];
    this.events = [];
    
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-add events for retry
      this.events.unshift(...events);
    }
  }
}
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Set up Replit Teams workspace
- [x] Configure development environment
- [x] Implement custom authentication system
- [x] Set up PostgreSQL and Redis
- [x] Create base database schema
- [x] Implement basic API structure
- [x] Set up Socket.io for real-time

### Phase 2: Core Game Systems (Week 3-4)
- [ ] Implement character creation and management
- [ ] Build progression system with infinite scaling
- [ ] Create movement and zone system
- [ ] Implement basic combat engine
- [ ] Add affinity tracking system
- [ ] Create inventory management

### Phase 3: Mobile UI/UX (Week 5-6)
- [ ] Build responsive React components
- [ ] Implement touch gesture controls
- [ ] Create mobile-optimized layouts
- [ ] Add PWA configuration
- [ ] Implement offline support
- [ ] Optimize performance for mobile

### Phase 4: Advanced Features (Week 7-8)
- [ ] Complete combat system with abilities
- [ ] Implement real-time chat system
- [ ] Add guild functionality
- [ ] Create trading system
- [ ] Implement PvP combat
- [ ] Add achievement system

### Phase 5: Content & Polish (Week 9-10)
- [ ] Create all 8 race starting zones
- [ ] Implement race-specific abilities
- [ ] Add NPCs and quests
- [ ] Balance game mechanics
- [ ] Performance optimization
- [ ] Security audit

### Phase 6: Testing & Launch (Week 11-12)
- [ ] Comprehensive testing suite
- [ ] Load testing with Replit Teams
- [ ] Beta testing with users
- [ ] Bug fixes and optimization
- [ ] Production deployment
- [ ] Post-launch monitoring

## Performance Optimization

### Mobile Performance Targets
- First Contentful Paint: < 1.2s
- Time to Interactive: < 2.5s
- Core Web Vitals: All green
- Bundle size: < 150KB initial
- Memory usage: < 50MB active

### Optimization Strategies

```typescript
// Performance optimizations
// 1. Code splitting
const CharacterCreation = lazy(() => import('./features/CharacterCreation'));
const CombatSystem = lazy(() => import('./features/CombatSystem'));

// 2. Virtual scrolling for lists
import { VirtualList } from '@tanstack/react-virtual';

// 3. Debounced updates
const debouncedUpdate = useMemo(
  () => debounce((data) => updateCharacter(data), 500),
  []
);

// 4. Memoized selectors
const selectCharacterStats = createSelector(
  [selectCharacter],
  (character) => character?.stats
);

// 5. Image optimization
const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};
```

This comprehensive design document provides a complete blueprint for implementing Aeturnis Online as a mobile-first MMORPG using Replit Teams, with custom authentication and all the advanced features needed for a production-ready game.