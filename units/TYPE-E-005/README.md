# TYPE-E-005: Equipment Routes - Multi-Step Operations

## Overview
Fix complex operation response handling in equipment routes, ensure proper equipment swap transaction responses, fix missing returns in error paths, and maintain response type consistency.

## Current Issues

### 1. Complex Operation Response Handling
- Equipment operations often involve multiple steps (unequip, equip, swap)
- Need to ensure all steps are properly reflected in responses

### 2. Equipment Swap Transaction Responses
- Swapping equipment involves transactional operations
- Responses must clearly indicate success/failure of each step

### 3. Missing Returns in Error Paths
- Complex operations may have multiple error paths
- All error paths must return appropriate responses

### 4. Response Type Consistency
- Equipment data structures need consistent formatting
- Item details, stats, and effects should be uniformly presented

## Tasks
1. Review all equipment route handlers for missing returns
2. Check equipment.routes.simple.ts for comparison
3. Add asyncHandler wrapper to all async routes
4. Standardize equipment operation responses
5. Ensure swap operations clearly indicate transaction status

## Files to Review
- `/packages/server/src/routes/equipment.routes.ts` - Main equipment routes
- `/packages/server/src/routes/equipment.routes.simple.ts` - Simplified version
- `/packages/server/src/controllers/equipment.controller.ts` - Equipment controller
- `/packages/server/src/services/EquipmentService.ts` - Equipment service

## Success Criteria
- All equipment route tests pass
- No missing return statements
- Equipment swap operations properly handled
- Clear transaction status in responses
- Consistent equipment data format