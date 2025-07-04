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

### Version 1.0.0 (July 4, 2025)
- Initial API release
- JWT authentication system
- User registration and login
- Socket.IO real-time communication
- Rate limiting and security headers

---

For questions or support, please refer to the [main documentation](../../README.md) or contact the development team.