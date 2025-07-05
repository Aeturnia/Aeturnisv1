# Aeturnis Online API Documentation

## Overview

The Aeturnis Online API provides RESTful endpoints for game operations and real-time WebSocket communication via Socket.IO. All API endpoints require proper authentication except for public endpoints like health checks.

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

## REST API Endpoints

### Health & Status

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-07-04T23:00:00.000Z",
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

#### API Status
```http
GET /api/status
```

**Response:**
```json
{
  "server": "Aeturnis Online API",
  "status": "operational",
  "environment": "development",
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
    "currency": "/api/v1/currency",
    "bank": "/api/v1/bank",
    "characters": "/api/v1/characters",
    "health": "/health",
    "status": "/api/status"
  }
}
```

### Authentication Endpoints

#### Register New User
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
      "created_at": "2025-07-04T23:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "\"email\" must be a valid email"
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "emailOrUsername": "player@example.com",
  "password": "SecurePass123!"
}
```

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

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get User Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <access-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "player@example.com",
    "username": "PlayerName",
    "roles": ["player"],
    "created_at": "2025-07-04T23:00:00.000Z",
    "updated_at": "2025-07-04T23:00:00.000Z"
  }
}
```

### Economy Endpoints

#### Get Currency Balance (Test)
```http
GET /api/v1/currency/test-balance
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 1500.75,
    "formattedBalance": "🪙 1.5K"
  }
}
```

#### Add Currency
```http
POST /api/v1/currency/add
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "characterId": "character-uuid",
  "amount": 100.50,
  "reason": "Quest reward"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "newBalance": 1601.25,
    "amountAdded": 100.50,
    "transactionId": "transaction-uuid"
  }
}
```

#### Subtract Currency
```http
POST /api/v1/currency/subtract
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "characterId": "character-uuid",
  "amount": 50.25,
  "reason": "Shop purchase"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "newBalance": 1551.00,
    "amountSubtracted": 50.25,
    "transactionId": "transaction-uuid"
  }
}
```

#### Get Transaction History
```http
GET /api/v1/currency/transactions/:characterId
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "transaction-uuid",
      "type": "credit",
      "amount": 100.50,
      "reason": "Quest reward",
      "timestamp": "2025-07-05T12:00:00.000Z",
      "balanceAfter": 1601.25
    },
    {
      "id": "transaction-uuid-2",
      "type": "debit",
      "amount": 50.25,
      "reason": "Shop purchase",
      "timestamp": "2025-07-05T11:30:00.000Z",
      "balanceAfter": 1551.00
    }
  ]
}
```

### Banking Endpoints

#### Get Bank Status (Test)
```http
GET /api/v1/bank/test-bank
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "personalBank": {
      "totalSlots": 50,
      "usedSlots": 12
    },
    "sharedBank": {
      "totalSlots": 100,
      "usedSlots": 8
    }
  }
}
```

#### Deposit Item to Personal Bank
```http
POST /api/v1/bank/personal/deposit
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "characterId": "character-uuid",
  "itemId": "item-uuid",
  "slot": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "itemId": "item-uuid",
    "slot": 5,
    "bankType": "personal"
  }
}
```

#### Withdraw Item from Personal Bank
```http
POST /api/v1/bank/personal/withdraw
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "characterId": "character-uuid",
  "slot": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "itemId": "item-uuid",
    "slot": 5,
    "withdrawnAt": "2025-07-05T12:00:00.000Z"
  }
}
```

#### Get Bank Contents
```http
GET /api/v1/bank/personal/:characterId
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "bankType": "personal",
    "totalSlots": 50,
    "usedSlots": 12,
    "items": [
      {
        "slot": 1,
        "itemId": "item-uuid-1",
        "name": "Iron Sword",
        "quantity": 1
      },
      {
        "slot": 5,
        "itemId": "item-uuid-2",
        "name": "Health Potion",
        "quantity": 10
      }
    ]
  }
}
```

### Character Endpoints

#### Create Character
```http
POST /api/v1/characters
Content-Type: application/json
Authorization: Bearer <jwt-token>

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
    "base_strength": 15,
    "base_dexterity": 12,
    "base_intelligence": 10,
    "base_constitution": 14,
    "base_wisdom": 11,
    "base_charisma": 9
  }
}
```

#### Get Character
```http
GET /api/v1/characters/:characterId
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "character-uuid",
    "name": "HeroName",
    "race": "human",
    "class": "warrior",
    "level": 25,
    "experience": 125000,
    "stats": {
      "strength": 18,
      "dexterity": 14,
      "intelligence": 12,
      "constitution": 17,
      "wisdom": 13,
      "charisma": 11
    },
    "resources": {
      "health": 340,
      "maxHealth": 340,
      "mana": 50,
      "maxMana": 50,
      "stamina": 150,
      "maxStamina": 150
    },
    "position": {
      "zone": "Tutorial Area",
      "x": 100.50,
      "y": 200.75,
      "z": 0.00
    }
  }
}
```

#### Validate Character Name
```http
GET /api/v1/characters/validate-name?name=HeroName
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "valid": true
  }
}
```

### Session Management Endpoints

#### Create Session
```http
POST /api/v1/sessions
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "metadata": {
    "platform": "web",
    "device": "Chrome 120"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "userId": "user-uuid",
    "expiresAt": "2025-08-04T23:00:00.000Z",
    "metadata": {
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "platform": "web"
    }
  }
}
```

#### Get User Sessions
```http
GET /api/v1/sessions
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "session-uuid-1",
      "lastActive": "2025-07-05T05:00:00.000Z",
      "platform": "web",
      "device": "Chrome 120"
    },
    {
      "sessionId": "session-uuid-2",
      "lastActive": "2025-07-05T04:30:00.000Z",
      "platform": "ios",
      "device": "iPhone 15"
    }
  ]
}
```

#### Extend Session
```http
PUT /api/v1/sessions/:sessionId/extend
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "newExpiresAt": "2025-08-04T23:00:00.000Z"
  }
}
```

#### Delete Session
```http
DELETE /api/v1/sessions/:sessionId
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Session destroyed successfully"
}
```

## Rate Limiting

### General API Endpoints
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Authentication Endpoints
- **Login**: 5 attempts per minute per IP
- **Register**: 10 attempts per 15 minutes per IP

**Rate Limit Error (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests from this IP"
  }
}
```

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

## Request/Response Format

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt-token>
X-Request-ID: <optional-request-id>
```

### Standard Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

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
```

## Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## CORS Policy

CORS is configured for:
- Development: `http://localhost:*`
- Production: Specific allowed origins

## Performance Metrics

- Average response time: < 50ms
- Database queries: Optimized with indexes
- Connection pooling: Max 20 connections
- Request timeout: 30 seconds

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
  
  async getProfile() {
    const response = await fetch(`${this.baseURL}/api/v1/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
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

**Get Profile:**
```bash
curl http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Changelog

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

For questions or support, please refer to the [main documentation](../../README.md) or contact the development team.