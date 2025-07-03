# API Documentation

## Overview

Aeturnis Online uses RESTful APIs for standard operations and WebSockets for real-time game interactions.

## Base URLs

- **REST API**: `http://localhost:3000/api`
- **WebSocket**: `ws://localhost:3000`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Characters

- `GET /api/characters` - Get user's characters
- `POST /api/characters` - Create new character
- `GET /api/characters/:id` - Get character details
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

### Game

- `GET /api/game/zones` - Get available game zones
- `POST /api/game/move` - Move character
- `GET /api/game/inventory/:characterId` - Get character inventory

## WebSocket Events

### Client → Server

- `character.move` - Move character
- `chat.message` - Send chat message
- `action.perform` - Perform game action

### Server → Client

- `game.update` - Game state update
- `character.moved` - Character movement update
- `chat.message` - Chat message received
- `combat.started` - Combat initiated

## Error Responses

All API errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limiting

- Standard endpoints: 100 requests per minute
- Authentication endpoints: 5 requests per minute
- WebSocket: 10 events per second