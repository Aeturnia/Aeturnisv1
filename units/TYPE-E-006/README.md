# TYPE-E-006: NPC & Dialogue Routes - Interaction Flows

## Overview
Fix dialogue state response handling, NPC interaction returns, quest acceptance responses, and trade completion handling in NPC and dialogue routes.

## Current Issues

### 1. Dialogue State Response Handling
- Dialogue systems need to maintain state across interactions
- Responses must clearly indicate current dialogue position

### 2. NPC Interaction Returns
- NPC interactions may have complex branching logic
- All interaction paths must return proper responses

### 3. Quest Acceptance Responses
- Quest acceptance involves multiple state changes
- Response must indicate quest added to journal

### 4. Trade Completion Handling
- Trade operations are transactional
- Must clearly indicate success/failure of trade

## Tasks
1. Review all NPC route handlers for missing returns
2. Review dialogue route handlers for state handling
3. Add asyncHandler wrapper to all async routes
4. Standardize interaction response formats
5. Ensure quest and trade operations have clear responses

## Files to Review
- `/packages/server/src/routes/npc.routes.ts` - NPC interaction routes
- `/packages/server/src/routes/dialogue.routes.ts` - Dialogue system routes (if exists)
- `/packages/server/src/controllers/npc.controller.ts` - NPC controller
- `/packages/server/src/services/NPCService.ts` - NPC service

## Success Criteria
- All NPC and dialogue route tests pass
- No missing return statements
- Dialogue state properly maintained
- Quest acceptance clearly communicated
- Trade results unambiguous