# Aeturnis Online API Documentation

## Overview

Aeturnis Online provides a production-ready RESTful API with comprehensive security, authentication, and monitoring features. The API is built with Express.js and includes structured logging, rate limiting, and comprehensive error handling.

## Base URLs

- **Development**: `http://localhost:5000`
- **Production**: `https://your-domain.com`
- **API v1**: `/api/v1`
- **Legacy API**: `/api` (for backward compatibility)

## Environment Status

The API automatically detects the environment and adjusts behavior accordingly:
- **Development**: Detailed error messages, CORS for localhost
- **Production**: Sanitized errors, restricted CORS, enhanced security

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Token Lifecycle
- **Access Token**: 15-minute expiration
- **Refresh Token**: 7-day expiration with rotation
- **Security**: Argon2id password hashing

## API Endpoints

### System Status

#### Health Check
```http
GET /health
```
Returns system health information including uptime, memory usage, and service status.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-07-04T06:00:00.000Z",
  "memory": {
    "rss": 73039872,
    "heapTotal": 16642048,
    "heapUsed": 15390136,
    "external": 3390787,
    "arrayBuffers": 65992
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
Returns API information and available features.

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

### Authentication

All authentication endpoints are rate-limited to 5 requests per 15 minutes.

#### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

#### Login User
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "emailOrUsername": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

#### Logout User
```http
POST /api/v1/auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

#### Get User Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <access-token>
```

#### Verify Token
```http
GET /api/v1/auth/verify
Authorization: Bearer <access-token>
```

### Legacy Authentication Endpoints

For backward compatibility, all authentication endpoints are also available at:
```
/api/auth/*
```

## Error Responses

All API errors follow a consistent structure with request correlation:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "requestId": "uuid-v4-format"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

The API implements multi-tier rate limiting:

### General Endpoints
- **Limit**: 100 requests per 15 minutes
- **Headers**: Standard rate limit headers included
- **Response**: 429 status with retry information

### Authentication Endpoints  
- **Limit**: 5 requests per 15 minutes
- **Scope**: Per IP address
- **Reset**: Sliding window

### Rate Limit Headers
```http
RateLimit-Policy: 100;w=900
RateLimit-Limit: 100
RateLimit-Remaining: 98
RateLimit-Reset: 750
```

## Security Features

### Security Headers
All responses include comprehensive security headers:
- Content Security Policy
- Strict Transport Security
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- Cross-Origin-Opener-Policy: same-origin

### CORS Configuration
- **Development**: localhost variants allowed
- **Production**: Configurable via ALLOWED_ORIGINS environment variable
- **Credentials**: Enabled for authenticated requests

### Request Tracking
Every request receives a unique ID for correlation:
```http
X-Request-ID: uuid-v4-format
```

## Performance

### Response Time
- **Target**: <10ms for most endpoints
- **Actual**: <5ms average response time
- **Monitoring**: X-Response-Time header included

### Compression
- **Gzip**: Enabled for eligible responses
- **Threshold**: Automatic detection

### Performance Headers
```http
X-Response-Time: 2.34ms
Content-Encoding: gzip
```

## Monitoring and Observability

### Structured Logging
All requests are logged in JSON format with:
- Request ID correlation
- Method, URL, and user agent
- Response status and timing
- Error details and stack traces

### Health Monitoring
- **Endpoint**: `/health`
- **Metrics**: Uptime, memory, database status
- **Format**: JSON with timestamp

## Future Endpoints

The following endpoints are planned for future releases:

### Characters (Coming Soon)
- `GET /api/v1/characters` - Get user's characters
- `POST /api/v1/characters` - Create new character
- `GET /api/v1/characters/:id` - Get character details
- `PUT /api/v1/characters/:id` - Update character
- `DELETE /api/v1/characters/:id` - Delete character

### Game System (Coming Soon)
- `GET /api/v1/game/zones` - Get available game zones
- `POST /api/v1/game/move` - Move character
- `GET /api/v1/game/inventory/:characterId` - Get character inventory

### WebSocket Integration (Future)
Real-time game interactions will be handled via WebSocket connections for:
- Character movement
- Chat system
- Combat events
- Game state updates