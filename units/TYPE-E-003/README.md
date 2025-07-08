# TYPE-E-003: Combat Routes - Async Handler Fixes

## Overview
Fix async route handler error handling in combat routes, ensure proper return statements, coordinate WebSocket events, and standardize response formats.

## Current Issues

### 1. Async Error Handling
- Combat routes use async operations but may not properly handle errors
- Need to ensure all async routes use proper error handling middleware

### 2. Missing Return Statements
- Combat action handlers may not return after sending responses
- Could lead to double response sending errors

### 3. WebSocket Coordination
- Combat events need to emit WebSocket events to connected clients
- Ensure proper coordination between HTTP responses and WebSocket emissions

### 4. Response Format
- Standardize all combat route responses to use consistent format
- Ensure error responses follow the same structure

## Tasks
1. Review all combat route handlers for missing returns
2. Add asyncHandler wrapper to all async routes
3. Standardize response formats
4. Fix WebSocket event emission coordination
5. Add proper validation middleware

## Files to Review
- `/packages/server/src/routes/combat.routes.ts` - Main combat routes
- `/packages/server/src/controllers/combat.controller.ts` - Combat controller
- `/packages/server/src/services/CombatService.ts` - Combat service
- `/packages/server/src/middleware/asyncHandler.ts` - Async handler middleware

## Success Criteria
- All combat route tests pass
- No missing return statements
- Consistent error handling
- WebSocket events properly emitted
- Standardized response format