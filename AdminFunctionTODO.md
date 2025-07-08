# Admin Function TODO - Aeturnis MMORPG

**Generated:** July 07, 2025  
**Purpose:** Strategic implementation plan for comprehensive admin functionality  
**Integration:** Designed to complement existing development without disruption

---

## Executive Summary

The Aeturnis codebase has foundational RBAC infrastructure but lacks essential admin tools for game management. This document provides a phased implementation plan that integrates smoothly with the current TypeScript error fixing initiative and ongoing development.

---

## Current State Analysis

### ✅ What Exists:
- Basic RBAC with three roles (user, moderator, admin)
- Authorization middleware (`authenticate` and `authorize`)
- Admin user seed data
- Audit log table structure
- Winston logging system
- Basic health check endpoints
- One admin endpoint (currency reward - missing auth)

### ❌ What's Missing:
- Admin dashboard/interface
- Player management tools
- Game configuration system
- Real-time monitoring
- Moderation capabilities
- Economy controls
- Event management
- GM in-game tools

---

## Implementation Strategy

### Phase 1: Foundation (1-2 weeks)
**Goal:** Secure existing admin features and create base infrastructure

#### 1.1 Fix Existing Admin Endpoint
```typescript
// Fix: packages/server/src/routes/currency.routes.ts
router.post('/admin/reward',
  requireAuth,
  authorize(['admin']), // Add this line
  adminRewardGold
);
```

#### 1.2 Create Admin Routes Module
```typescript
// New file: packages/server/src/routes/admin/index.ts
import { Router } from 'express';
import { requireAuth, authorize } from '../../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth, authorize(['admin']));

// Sub-routers
router.use('/players', playerAdminRoutes);
router.use('/config', configAdminRoutes);
router.use('/monitor', monitorAdminRoutes);
router.use('/economy', economyAdminRoutes);

export default router;
```

#### 1.3 Create Admin Service
```typescript
// New file: packages/server/src/services/AdminService.ts
export class AdminService {
  // Player management
  async banPlayer(playerId: string, reason: string, duration?: number): Promise<void>
  async unbanPlayer(playerId: string): Promise<void>
  async kickPlayer(playerId: string, reason: string): Promise<void>
  
  // System controls
  async setMaintenanceMode(enabled: boolean): Promise<void>
  async broadcastMessage(message: string, type: 'info' | 'warning' | 'alert'): Promise<void>
}
```

---

### Phase 2: Player Management (1 week)
**Goal:** Essential player control capabilities

#### 2.1 Player Management Endpoints
```typescript
// GET /api/v1/admin/players - List players with filters
// GET /api/v1/admin/players/:id - Get player details
// POST /api/v1/admin/players/:id/ban - Ban player
// DELETE /api/v1/admin/players/:id/ban - Unban player
// POST /api/v1/admin/players/:id/kick - Kick player
// POST /api/v1/admin/players/:id/warn - Issue warning
// GET /api/v1/admin/players/:id/characters - List player's characters
```

#### 2.2 Database Schema Update
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN ban_reason TEXT;
ALTER TABLE users ADD COLUMN ban_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN warnings INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_warning_at TIMESTAMP WITH TIME ZONE;
```

---

### Phase 3: Configuration Management (1 week)
**Goal:** Dynamic game configuration without deployments

#### 3.1 Configuration Table
```sql
CREATE TABLE system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  data_type VARCHAR(50) NOT NULL,
  constraints JSONB,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_system_configs_category ON system_configs(category);
CREATE INDEX idx_system_configs_key ON system_configs(key);
```

#### 3.2 Configuration Categories
```typescript
enum ConfigCategory {
  GAME_BALANCE = 'game_balance',
  RATE_LIMITS = 'rate_limits',
  ECONOMY = 'economy',
  COMBAT = 'combat',
  PROGRESSION = 'progression',
  FEATURES = 'features'
}

// Example configurations
const defaultConfigs = [
  { key: 'death.xp_loss_percentage', value: 0.8, category: 'game_balance' },
  { key: 'death.respawn_cooldown_ms', value: 30000, category: 'game_balance' },
  { key: 'loot.party_bonus_multiplier', value: 1.2, category: 'game_balance' },
  { key: 'combat.pvp_enabled', value: true, category: 'features' },
  { key: 'economy.bank_slot_base_cost', value: 1000, category: 'economy' }
];
```

---

### Phase 4: Real-time Monitoring (1-2 weeks)
**Goal:** Live game monitoring and analytics

#### 4.1 Admin Socket Namespace
```typescript
// New: packages/server/src/sockets/admin.socket.ts
export function initializeAdminSocket(io: Server) {
  const adminNamespace = io.of('/admin');
  
  adminNamespace.use(socketAuth);
  adminNamespace.use(requireAdminRole);
  
  adminNamespace.on('connection', (socket) => {
    // Real-time stats
    socket.join('admin:monitoring');
    
    // Send initial stats
    socket.emit('stats:initial', await getSystemStats());
    
    // Subscribe to live updates
    socket.on('monitor:players', () => startPlayerMonitoring(socket));
    socket.on('monitor:economy', () => startEconomyMonitoring(socket));
    socket.on('monitor:performance', () => startPerformanceMonitoring(socket));
  });
}
```

#### 4.2 Monitoring Service
```typescript
export class MonitoringService {
  async getSystemStats(): Promise<SystemStats>
  async getPlayerMetrics(): Promise<PlayerMetrics>
  async getEconomyMetrics(): Promise<EconomyMetrics>
  async getPerformanceMetrics(): Promise<PerformanceMetrics>
  
  // Real-time broadcasts
  broadcastPlayerCount(count: number): void
  broadcastEconomyUpdate(metrics: EconomyMetrics): void
  broadcastSystemAlert(alert: SystemAlert): void
}
```

---

### Phase 5: Admin Dashboard UI (2 weeks)
**Goal:** Web-based admin interface

#### 5.1 Admin Dashboard Routes
```typescript
// Serve admin dashboard
router.get('/admin', requireAuth, authorize(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-ui/index.html'));
});
```

#### 5.2 Dashboard Features
- **Overview**: System health, player count, recent activity
- **Players**: Search, view, manage players
- **Economy**: Gold flow, item distribution, inflation metrics
- **Logs**: View and search system logs
- **Config**: Edit game configurations
- **Alerts**: System alerts and notifications

---

### Phase 6: Advanced Features (2-3 weeks)
**Goal:** Comprehensive game management

#### 6.1 GM Commands System
```typescript
interface GMCommand {
  name: string;
  description: string;
  usage: string;
  minRole: 'moderator' | 'admin';
  handler: (args: string[], context: CommandContext) => Promise<void>;
}

// Example commands
const commands: GMCommand[] = [
  { name: 'teleport', usage: '/teleport <player> <x> <y> <z>' },
  { name: 'spawn', usage: '/spawn <monster> [count] [location]' },
  { name: 'give', usage: '/give <player> <item> [quantity]' },
  { name: 'setlevel', usage: '/setlevel <player> <level>' },
  { name: 'announce', usage: '/announce <message>' }
];
```

#### 6.2 Event Management
```typescript
interface GameEvent {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  modifiers: EventModifier[];
  rewards: EventReward[];
}

interface EventModifier {
  type: 'xp_rate' | 'drop_rate' | 'gold_rate';
  multiplier: number;
}
```

---

## Integration Plan

### Minimal Disruption Strategy

1. **Parallel Development**
   - Admin features in separate `/admin` directory
   - New routes under `/api/v1/admin` prefix
   - Separate admin Socket.IO namespace

2. **Database Migrations**
   - Non-breaking additions only
   - New tables don't affect existing schema
   - Optional fields for backwards compatibility

3. **Service Integration**
   - AdminService as standalone service
   - Inject into ServiceProvider
   - Existing services remain unchanged

4. **Testing Approach**
   - Separate test suite for admin features
   - No modification to existing tests
   - Admin-specific test database seeds

---

## Priority Implementation Order

### Week 1-2: Critical Foundation
1. Fix currency admin endpoint authorization ⚡
2. Create admin routes structure
3. Implement player ban/unban system
4. Add audit logging to admin actions

### Week 3-4: Core Management
1. Configuration management system
2. Basic monitoring endpoints
3. Player search and view
4. System broadcast messages

### Week 5-6: Enhanced Control
1. Admin Socket.IO namespace
2. Real-time monitoring
3. Economy controls
4. Basic GM commands

### Week 7-8: Dashboard
1. Admin UI framework
2. Dashboard pages
3. Log viewer
4. Configuration editor

---

## Security Considerations

1. **Authentication**
   - All admin endpoints require JWT auth
   - Admin role verification on every request
   - Separate admin session management

2. **Authorization**
   - Granular permissions per admin action
   - Role-based feature access
   - Audit trail for all admin actions

3. **Rate Limiting**
   - Stricter limits for admin endpoints
   - Prevent admin abuse
   - Alert on suspicious activity

4. **Logging**
   - Detailed admin action logs
   - IP tracking for admin access
   - Failed admin auth attempts

---

## Success Metrics

1. **Functionality**
   - All critical admin features implemented
   - Zero unauthorized admin access
   - <100ms response time for admin queries

2. **Usability**
   - Admin tasks completed 80% faster
   - Reduced need for direct database access
   - Self-service configuration changes

3. **Monitoring**
   - Real-time visibility into game state
   - Proactive issue detection
   - Historical metrics for planning

---

## Conclusion

This phased approach provides comprehensive admin functionality while maintaining compatibility with ongoing development. The modular design allows for incremental implementation without disrupting the existing codebase or current TypeScript fixing efforts.

**Total Estimated Time:** 8-10 weeks for full implementation  
**Minimum Viable Admin System:** 2-3 weeks (Phases 1-2)