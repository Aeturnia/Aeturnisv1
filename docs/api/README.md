# Aeturnis Online API Documentation

## Overview

The Aeturnis Online API provides RESTful endpoints for game operations and real-time WebSocket communication via Socket.IO. All API endpoints require proper authentication except for public endpoints like health checks and test endpoints.

**Version**: 2.6.0  
**Last Updated**: January 7, 2025

## Base URL

```
Development: http://localhost:5000
Production: https://api.aeturnis.online
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Table of Contents

1. [Health & Status](#health--status)
2. [Authentication](#authentication-endpoints)
3. [Session Management](#session-management)
4. [Character System](#character-system)
5. [Economy & Currency](#economy--currency)
6. [Banking System](#banking-system)
7. [Equipment & Inventory](#equipment--inventory)
8. [Combat System](#combat-system)
9. [Death & Respawn](#death--respawn)
10. [Loot System](#loot-system)
11. [Monster System](#monster-system)
12. [NPC System](#npc-system)
13. [Rate Limiting](#rate-limiting)
14. [Error Codes](#error-codes)
15. [WebSocket Events](#websocket-connection)

---

## Health & Status

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-01-07T12:00:00.000Z",
  "memory": {
    "rss": 123456789,
    "heapTotal": 123456789,
    "heapUsed": 123456789,
    "external": 123456789
  },
  "services": {
    "database": "connected",
    "redis": "disabled"
  }
}
```

### API Status
```http
GET /api/status
```

**Response:**
```json
{
  "server": "Aeturnis Online API",
  "status": "operational",
  "version": "2.6.0",
  "environment": "development",
  "uptime": 3600,
  "features": [
    "authentication",
    "rate-limiting",
    "structured-logging",
    "security-headers",
    "compression",
    "performance-tracking"
  ],
  "endpoints": {
    "auth": "/api/v1/auth",
    "sessions": "/api/v1/sessions",
    "characters": "/api/v1/characters",
    "currency": "/api/v1/currency",
    "bank": "/api/v1/bank",
    "equipment": "/api/v1/equipment",
    "combat": "/api/v1/combat",
    "death": "/api/v1/death",
    "loot": "/api/v1/loot",
    "monsters": "/api/v1/monsters",
    "npcs": "/api/v1/npcs",
    "health": "/health",
    "status": "/api/status"
  }
}
```

---

## Authentication Endpoints

Base URL: `/api/v1/auth` (also available at `/api/auth` for backward compatibility)

### Register New User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "player@example.com",
  "username": "PlayerName",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- Email: Valid email format required
- Username: 3-20 characters, alphanumeric only
- Password: Minimum 8 characters, must contain uppercase, lowercase, number, and special character

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "player@example.com",
      "username": "PlayerName",
      "roles": ["player"],
      "created_at": "2025-01-07T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "emailOrUsername": "player@example.com",
  "password": "SecurePass123!"
}
```

**Rate Limit**: 5 attempts per minute per IP

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "player@example.com",
      "username": "PlayerName",
      "roles": ["player"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
```

### Get User Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <access-token>
```

### Verify Token
```http
GET /api/v1/auth/verify
Authorization: Bearer <access-token>
```

---

## Session Management

Base URL: `/api/v1/sessions`

### Create Session
```http
POST /api/v1/sessions/create
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "metadata": {
    "platform": "web",
    "device": "Chrome 120"
  }
}
```

### Get Session Information
```http
GET /api/v1/sessions/:sessionId
Authorization: Bearer <access-token>
```

### Get User Sessions
```http
GET /api/v1/sessions/user/sessions
Authorization: Bearer <access-token>
```

### Extend Session
```http
POST /api/v1/sessions/:sessionId/extend
Authorization: Bearer <access-token>
```

### Delete Session
```http
DELETE /api/v1/sessions/:sessionId
Authorization: Bearer <access-token>
```

---

## Character System

Base URL: `/api/v1/characters`

### Test Endpoint
```http
GET /api/v1/characters/test
```

### Create Character
```http
POST /api/v1/characters
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "name": "HeroName",
  "race": "human",
  "class": "warrior",
  "gender": "male"
}
```

**Validation Rules:**
- Name: 3-50 characters, no special characters except hyphens/apostrophes
- Race: human, elf, dwarf, orc, halfling, dragonborn
- Class: warrior, mage, rogue, cleric, ranger, paladin
- Gender: male, female, other

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "character-uuid",
    "name": "HeroName",
    "race": "human",
    "class": "warrior",
    "level": 1,
    "experience": 0,
    "health": 120,
    "mana": 20,
    "stamina": 60,
    "base_strength": 15,
    "base_dexterity": 12,
    "base_intelligence": 10,
    "base_constitution": 14,
    "base_wisdom": 11,
    "base_charisma": 9
  }
}
```

### Get All Characters
```http
GET /api/v1/characters
Authorization: Bearer <access-token>
```

### Get Character by ID
```http
GET /api/v1/characters/:id
Authorization: Bearer <access-token>
```

### Delete Character
```http
DELETE /api/v1/characters/:id
Authorization: Bearer <access-token>
```

### Update Character Position
```http
PATCH /api/v1/characters/:id/position
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "zone": "tutorial_area",
  "x": 100.5,
  "y": 0,
  "z": 200.75
}
```

### Add Experience
```http
POST /api/v1/characters/:id/experience
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "amount": 1000,
  "source": "quest_completion"
}
```

### Allocate Stat Points
```http
POST /api/v1/characters/:id/stats
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "strength": 2,
  "dexterity": 1,
  "intelligence": 0,
  "constitution": 2,
  "wisdom": 0,
  "charisma": 0
}
```

### Update Resources
```http
PATCH /api/v1/characters/:id/resources
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "health": 50,
  "mana": 30,
  "stamina": 40
}
```

### Prestige Character
```http
POST /api/v1/characters/:id/prestige
Authorization: Bearer <access-token>
```

### Allocate Paragon Points
```http
POST /api/v1/characters/:id/paragon
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "strength": 5,
  "dexterity": 3,
  "intelligence": 2
}
```

### Validate Character Name
```http
GET /api/v1/characters/validate-name/:name
```
or
```http
POST /api/v1/characters/validate-name
Content-Type: application/json

{
  "name": "HeroName"
}
```

### Get Random Appearance
```http
GET /api/v1/characters/appearance/:race
```

### Update Last Played
```http
PATCH /api/v1/characters/:id/last-played
Authorization: Bearer <access-token>
```

### Get Stats Breakdown
```http
GET /api/v1/characters/:id/stats
Authorization: Bearer <access-token>
```

---

## Economy & Currency

Base URL: `/api/v1/currency`

### Test Balance Endpoint
```http
GET /api/v1/currency/test-balance
```

### Get Character Balance
```http
GET /api/v1/currency/characters/:characterId/balance
Authorization: Bearer <access-token>
```

### Transfer Currency
```http
POST /api/v1/currency/transfer
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "fromCharacterId": "character-uuid-1",
  "toCharacterId": "character-uuid-2",
  "amount": 100.50,
  "reason": "Trade"
}
```

### Get Transaction History
```http
GET /api/v1/currency/characters/:characterId/transactions
Authorization: Bearer <access-token>
```

### Get Transaction Statistics
```http
GET /api/v1/currency/characters/:characterId/stats
Authorization: Bearer <access-token>
```

### Admin Reward Gold
```http
POST /api/v1/currency/admin/reward
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "characterId": "character-uuid",
  "amount": 1000,
  "reason": "Admin reward"
}
```

---

## Banking System

Base URL: `/api/v1/bank`

### Test Bank Endpoint
```http
GET /api/v1/bank/test-bank
```

### Get Personal Bank
```http
GET /api/v1/bank/characters/:characterId/bank
Authorization: Bearer <access-token>
```

### Get Shared Bank
```http
GET /api/v1/bank/users/:userId/shared-bank
Authorization: Bearer <access-token>
```

### Add Item to Bank
```http
POST /api/v1/bank/characters/:characterId/bank/items
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "itemId": "item-uuid",
  "slot": 5,
  "quantity": 1
}
```

### Remove Item from Bank
```http
DELETE /api/v1/bank/characters/:characterId/bank/items/:slot
Authorization: Bearer <access-token>
```

### Transfer Items
```http
POST /api/v1/bank/characters/:characterId/bank/transfer
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "fromType": "personal",
  "toType": "shared",
  "fromSlot": 5,
  "toSlot": 10
}
```

### Expand Bank Slots
```http
POST /api/v1/bank/characters/:characterId/bank/expand
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "slots": 10
}
```

---

## Equipment & Inventory

Base URL: `/api/v1/equipment`

### Test Equipment Endpoint
```http
GET /api/v1/equipment/test
```

### Get Equipped Items
```http
GET /api/v1/equipment/:charId
Authorization: Bearer <access-token>
```

### Get Inventory
```http
GET /api/v1/equipment/:charId/inventory
Authorization: Bearer <access-token>
```

### Equip Item
```http
POST /api/v1/equipment/:charId/equip
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "itemId": "item-uuid",
  "slot": "weapon"
}
```

### Unequip Item
```http
POST /api/v1/equipment/:charId/unequip
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "slot": "weapon"
}
```

### Get Equipment Stats
```http
GET /api/v1/equipment/:charId/stats
Authorization: Bearer <access-token>
```

### Move Inventory Items
```http
POST /api/v1/equipment/:charId/inventory/move
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "fromSlot": 5,
  "toSlot": 10
}
```

### Drop Items
```http
POST /api/v1/equipment/:charId/inventory/drop
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "slot": 5,
  "quantity": 1
}
```

### Get Item Details
```http
GET /api/v1/equipment/items/:itemId
Authorization: Bearer <access-token>
```

### Check Equipment Compatibility
```http
GET /api/v1/equipment/:charId/can-equip/:itemId/:slot
Authorization: Bearer <access-token>
```

### Get Equipment Value
```http
GET /api/v1/equipment/:charId/value
Authorization: Bearer <access-token>
```

---

## Combat System

Base URL: `/api/v1/combat`

### Test Endpoints (No Authentication Required)

#### Test Combat System
```http
GET /api/v1/combat/test
```

#### Get Test Monsters
```http
GET /api/v1/combat/test-monsters
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "test_goblin_001",
      "name": "Test Goblin",
      "level": 1,
      "health": 50,
      "maxHealth": 50
    },
    {
      "id": "test_wolf_001",
      "name": "Test Wolf",
      "level": 2,
      "health": 75,
      "maxHealth": 75
    }
  ]
}
```

#### Start Test Combat
```http
POST /api/v1/combat/test-start
Content-Type: application/json

{
  "playerId": "player-test-001",
  "enemyId": "test_goblin_001"
}
```

#### Get Combat Session
```http
GET /api/v1/combat/session/:sessionId
```

#### Perform Test Combat Action
```http
POST /api/v1/combat/test-action
Content-Type: application/json

{
  "sessionId": "combat-session-uuid",
  "action": "attack",
  "targetId": "test_goblin_001"
}
```

Actions: `attack`, `defend`, `flee`, `skill`

#### Flee from Test Combat
```http
POST /api/v1/combat/flee/:sessionId
```

### Authenticated Combat Endpoints

#### Start Combat
```http
POST /api/v1/combat/start
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "characterId": "character-uuid",
  "enemyId": "monster-uuid"
}
```

#### Perform Combat Action
```http
POST /api/v1/combat/auth-action
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "sessionId": "combat-session-uuid",
  "action": "attack",
  "targetId": "monster-uuid"
}
```

#### Get Character Combat Stats
```http
GET /api/v1/combat/stats/:charId
Authorization: Bearer <access-token>
```

#### Get Character Resources
```http
GET /api/v1/combat/resources/:charId
Authorization: Bearer <access-token>
```

### Development Only

#### Simulate Combat
```http
POST /api/v1/combat/simulate
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "attackerId": "character-uuid",
  "defenderId": "monster-uuid",
  "rounds": 10
}
```

---

## Death & Respawn

Base URL: `/api/v1/death`

### Test Endpoints (No Authentication Required)

#### Test Death System
```http
GET /api/v1/death/test
```

#### Test Character Death
```http
POST /api/v1/death/test-death
Content-Type: application/json

{
  "characterId": "test-character-001"
}
```

#### Test Character Respawn
```http
POST /api/v1/death/test-respawn
Content-Type: application/json

{
  "characterId": "test-character-001"
}
```

#### Test Death Status
```http
GET /api/v1/death/test-status
```

### Authenticated Endpoints

#### Process Character Death
```http
POST /api/v1/death/:characterId
Authorization: Bearer <access-token>
```

#### Respawn Character
```http
POST /api/v1/death/:characterId/respawn
Authorization: Bearer <access-token>
```

#### Get Death Status
```http
GET /api/v1/death/:characterId/status
Authorization: Bearer <access-token>
```

---

## Loot System

Base URL: `/api/v1/loot`

### Test Endpoints (No Authentication Required)

#### Test Loot System
```http
GET /api/v1/loot/test
```

#### Test Claim Loot
```http
POST /api/v1/loot/test-claim
Content-Type: application/json

{
  "sessionId": "combat-session-uuid"
}
```

#### Test Calculate Loot
```http
POST /api/v1/loot/test-calculate
Content-Type: application/json

{
  "monsterId": "test_goblin_001",
  "playerLevel": 5
}
```

#### Get Loot Tables
```http
GET /api/v1/loot/tables
```

### Authenticated Endpoints

#### Claim Combat Loot
```http
POST /api/v1/loot/combat/:sessionId/claim
Authorization: Bearer <access-token>
```

#### Get Loot History
```http
GET /api/v1/loot/history/:characterId
Authorization: Bearer <access-token>
```

#### Calculate Loot Drops
```http
POST /api/v1/loot/calculate
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "monsterId": "monster-uuid",
  "characterId": "character-uuid"
}
```

---

## Monster System

Base URL: `/api/v1/monsters`

### Test Monster System
```http
GET /api/v1/monsters/test
```

### Get Monsters in Zone
```http
GET /api/v1/monsters/zone/:zoneId
Authorization: Bearer <access-token>
```

### Spawn Monster
```http
POST /api/v1/monsters/spawn
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "zoneId": "tutorial_area",
  "monsterId": "goblin_warrior",
  "position": {
    "x": 100,
    "y": 0,
    "z": 100
  }
}
```

### Update Monster State
```http
PATCH /api/v1/monsters/:monsterId/state
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "state": "aggressive",
  "targetId": "character-uuid"
}
```

States: `idle`, `patrol`, `aggressive`, `fleeing`, `dead`

### Kill/Delete Monster
```http
DELETE /api/v1/monsters/:monsterId
Authorization: Bearer <access-token>
```

### Get Monster Types
```http
GET /api/v1/monsters/types
```

### Get Spawn Points
```http
GET /api/v1/monsters/spawn-points/:zoneId
Authorization: Bearer <access-token>
```

---

## NPC System

Base URL: `/api/v1/npcs`

### Test NPC System
```http
GET /api/v1/npcs/test
```

### Get NPCs in Zone
```http
GET /api/v1/npcs/zone/:zoneId
Authorization: Bearer <access-token>
```

### Start NPC Interaction
```http
POST /api/v1/npcs/:npcId/interact
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "characterId": "character-uuid"
}
```

### Advance Dialogue
```http
POST /api/v1/npcs/:npcId/dialogue/advance
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "characterId": "character-uuid",
  "choiceIndex": 0
}
```

### Get Interaction History
```http
GET /api/v1/npcs/interactions/character/:characterId
Authorization: Bearer <access-token>
```

### Get Quest Givers
```http
GET /api/v1/npcs/quest-givers
Authorization: Bearer <access-token>
```

---

## Rate Limiting

### General API Endpoints
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

### Authentication Endpoints
- **Login**: 5 attempts per minute per IP
- **Register**: 10 attempts per 15 minutes per IP

**Rate Limit Error (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests from this IP",
    "retryAfter": 60
  }
}
```

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | UNAUTHORIZED | Authentication failed |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... } // Optional additional information
  },
  "requestId": "uuid-v4"
}
```

---

## WebSocket Connection

See [Socket.IO Events Documentation](../socketio/events.md) for real-time communication.

### Quick Start
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: accessToken // JWT from login
  }
});

socket.on('connect', () => {
  console.log('Connected to game server');
});

// Join zone room
socket.emit('zone:join', { zoneId: 'tutorial_area' });

// Listen for combat events
socket.on('combat:damage', (data) => {
  console.log(`${data.targetId} took ${data.amount} damage!`);
});
```

### Available Socket Events

#### Connection Events
- `connect` - Successfully connected
- `disconnect` - Disconnected from server
- `error` - Connection error

#### Zone Events
- `zone:join` - Join a zone room
- `zone:leave` - Leave a zone room
- `zone:players` - Players in zone update

#### Combat Events
- `combat:start` - Combat initiated
- `combat:action` - Combat action performed
- `combat:damage` - Damage dealt
- `combat:end` - Combat ended

#### Chat Events
- `chat:message` - Chat message
- `chat:whisper` - Private message
- `chat:typing` - User typing indicator

#### Character Events
- `character:move` - Character movement
- `character:levelUp` - Level up notification
- `character:death` - Death notification

#### Monster Events
- `monster:spawned` - Monster spawned
- `monster:killed` - Monster killed
- `monster:state-changed` - Monster state changed

#### NPC Events
- `npc:dialogue-started` - Dialogue started
- `npc:dialogue-updated` - Dialogue progressed
- `npc:trade-started` - Trade window opened

---

## Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `X-Request-ID: <uuid>` - Request correlation ID

---

## CORS Policy

CORS is configured for:
- Development: `http://localhost:*`
- Production: Specific allowed origins only

---

## Performance Metrics

- **Average Response Time**: < 50ms
- **Database Queries**: Optimized with indexes
- **Connection Pooling**: Max 20 connections
- **Request Timeout**: 30 seconds
- **Payload Limit**: 10MB for JSON

---

## SDK Examples

### JavaScript/TypeScript
```typescript
class AeturnisAPI {
  private baseURL = 'http://localhost:5000';
  private token: string | null = null;
  
  async login(emailOrUsername: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ emailOrUsername, password })
    });
    
    const data = await response.json();
    if (data.success) {
      this.token = data.data.accessToken;
    }
    return data;
  }
  
  async createCharacter(characterData: any) {
    const response = await fetch(`${this.baseURL}/api/v1/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(characterData)
    });
    
    return response.json();
  }
  
  async startCombat(characterId: string, enemyId: string) {
    const response = await fetch(`${this.baseURL}/api/v1/combat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ characterId, enemyId })
    });
    
    return response.json();
  }
}
```

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"test@example.com","password":"Test123!"}'
```

**Create Character:**
```bash
curl -X POST http://localhost:5000/api/v1/characters \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"HeroName","race":"human","class":"warrior","gender":"male"}'
```

**Start Combat:**
```bash
curl -X POST http://localhost:5000/api/v1/combat/test-start \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-test-001","enemyId":"test_goblin_001"}'
```

---

## Changelog

### Version 2.6.0 (January 7, 2025)
- Added Monster System API endpoints
- Added NPC System API endpoints with dialogue support
- Enhanced combat system with test endpoints
- Added death and respawn system
- Added loot system with drop calculations
- Updated documentation to include all endpoints

### Version 2.4.0 (July 6, 2025)
- Added Combat Engine v2.0 with AI behavior
- Implemented Equipment System endpoints
- Added Death & Respawn mechanics
- Enhanced Character System with AIPE

### Version 1.1.0 (July 5, 2025)
- Added Character API endpoints (create, retrieve, validate name)
- Implemented Session Management API
- Enhanced authentication with session tracking
- Character system with 6 races and 6 classes
- Infinite progression mechanics support

### Version 1.0.0 (July 4, 2025)
- Initial API release
- JWT authentication system
- User registration and login
- Socket.IO real-time communication
- Rate limiting and security headers

---

## API Endpoint Summary

Total Endpoints: **108**

| System | Authenticated | Test/Public | Total |
|--------|--------------|-------------|-------|
| Authentication | 6 | 0 | 6 |
| Sessions | 5 | 0 | 5 |
| Characters | 16 | 1 | 17 |
| Currency | 5 | 1 | 6 |
| Banking | 6 | 1 | 7 |
| Equipment | 10 | 1 | 11 |
| Combat | 8 | 9 | 17 |
| Death | 3 | 4 | 7 |
| Loot | 3 | 4 | 7 |
| Monsters | 6 | 1 | 7 |
| NPCs | 5 | 1 | 6 |
| Health/Status | 0 | 2 | 2 |
| **Total** | **73** | **25** | **98** |

*Note: Some endpoints have multiple versions (e.g., /api/auth and /api/v1/auth), counted as single endpoint.*

---

For questions or support, please refer to the [main documentation](../../README.md) or contact the development team.