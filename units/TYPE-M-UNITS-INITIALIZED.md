# TYPE-M Units Initialization

**Created:** 2025-07-08
**Purpose:** Configuration and Console fixes - TSConfig updates and console statement handling

## Overview

TYPE-M units focus on fixing configuration issues (particularly TSConfig not including .d.ts files) and properly handling console statements that are currently warnings.

## TYPE-M Units Definition

### TYPE-M-001: TSConfig Declaration Files
**Target Files:**
- `/packages/shared/tsconfig.json`
- `/packages/server/tsconfig.json`
- Root `tsconfig.json`

**Issues to Fix:**
- .d.ts files not being included in compilation
- Missing type declaration files
- Module resolution issues

**Pattern:**
```json
// Current tsconfig.json might be missing
{
  "compilerOptions": {
    // ...
  },
  "include": [
    "src/**/*"  // Might not include .d.ts
  ]
}

// Fixed
{
  "compilerOptions": {
    // ...
  },
  "include": [
    "src/**/*",
    "src/**/*.d.ts",  // Explicitly include
    "types/**/*.d.ts"
  ]
}
```

**Expected Impact:** Fix missing type errors

---

### TYPE-M-002: Console Statement Management
**Target Files:**
- All files with console.warn statements (43 warnings)
- Provider initialization files
- Debug/development files

**Issues to Fix:**
- Replace console.warn with logger.warn
- Conditionally include console statements
- Add proper logging configuration

**Pattern:**
```typescript
// Current
console.warn('Redis not available, using in-memory cache');

// Fixed - Option 1: Use logger
logger.warn('Redis not available, using in-memory cache');

// Fixed - Option 2: Conditional for dev
if (process.env.NODE_ENV === 'development') {
  console.warn('Redis not available, using in-memory cache');
}

// Fixed - Option 3: ESLint disable for specific cases
// eslint-disable-next-line no-console
console.warn('Critical startup warning');
```

**Expected Impact:** 43 warnings resolved

---

### TYPE-M-003: ESLint Configuration Updates
**Target Files:**
- `.eslintrc.js` or `.eslintrc.json`
- Package-specific ESLint configs

**Updates Needed:**
- Configure console rule appropriately
- Set up environment-specific rules
- Handle provider initialization logs

**Pattern:**
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-console': ['warn', { 
      allow: ['warn', 'error'] 
    }],
    // OR for specific files
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  },
  overrides: [
    {
      files: ['**/providers/**/*.ts'],
      rules: {
        'no-console': 'off' // Allow in providers
      }
    }
  ]
};
```

---

## Configuration Strategy

### 1. TSConfig Updates
1. Audit all packages for tsconfig.json files
2. Ensure declaration files are included
3. Check references between packages
4. Verify paths mappings
5. Test type resolution

### 2. Logging Strategy
1. Implement consistent logging:
   ```typescript
   import { logger } from '@/utils/logger';
   
   // Use appropriate levels
   logger.debug('Debug information');
   logger.info('General information');
   logger.warn('Warning messages');
   logger.error('Error messages');
   ```

2. Create logging configuration:
   ```typescript
   // config/logger.ts
   export const loggerConfig = {
     level: process.env.LOG_LEVEL || 'info',
     silent: process.env.NODE_ENV === 'test',
     format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty'
   };
   ```

### 3. Environment-Specific Handling
```typescript
// utils/debug.ts
export const debugLog = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEBUG]', ...args);
  }
};
```

## Success Criteria

- All .d.ts files properly included
- No missing type declaration errors
- Console warnings resolved appropriately
- Logging strategy implemented
- No loss of important log information

## Assignment Guidelines

Configuration fixes should be assigned to agents with:
- TSConfig expertise
- Understanding of TypeScript compilation
- ESLint configuration knowledge
- Experience with logging best practices

---

*TYPE-M units focus on configuration and logging improvements, ensuring a clean build and proper observability.*