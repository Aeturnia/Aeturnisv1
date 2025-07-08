# TYPE-E-004: Bank & Currency Routes - Transaction Handling

## Overview
Fix transaction response handling in bank and currency routes, ensure proper error rollback responses, fix missing return statements, and maintain consistent error formats.

## Current Issues

### 1. Transaction Response Handling
- Bank and currency operations involve transactions that need careful error handling
- Responses must clearly indicate success or failure of transactions

### 2. Error Rollback Responses
- When transactions fail, the response should indicate if rollback occurred
- Need consistent error response format for transaction failures

### 3. Missing Return Statements
- Some route handlers may not return after sending responses
- Could lead to double response errors

### 4. Error Format Consistency
- Transaction errors should have consistent format
- Include transaction details in error responses where appropriate

## Tasks
1. Review all bank route handlers for missing returns
2. Review all currency route handlers for missing returns
3. Add asyncHandler wrapper to all async routes
4. Standardize transaction error responses
5. Ensure rollback status is communicated in errors

## Files to Review
- `/packages/server/src/routes/bank.routes.ts` - Bank transaction routes
- `/packages/server/src/routes/currency.routes.ts` - Currency transaction routes
- `/packages/server/src/controllers/bank.controller.ts` - Bank controller
- `/packages/server/src/controllers/currency.controller.ts` - Currency controller

## Success Criteria
- All bank and currency route tests pass
- No missing return statements
- Consistent transaction error handling
- Clear rollback status in error responses
- Standardized response format