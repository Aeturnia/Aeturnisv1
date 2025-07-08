// Runtime JSON Validation Utilities for Type Assertions

import { ValidationError } from './errors';

// Generic Type Guards
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// Property Validators
export function hasProperty<T extends string>(
  obj: unknown, 
  prop: T
): obj is Record<T, unknown> {
  return isObject(obj) && prop in obj;
}

export function hasStringProperty<T extends string>(
  obj: unknown, 
  prop: T
): obj is Record<T, string> {
  return hasProperty(obj, prop) && isString(obj[prop]);
}

export function hasNumberProperty<T extends string>(
  obj: unknown, 
  prop: T
): obj is Record<T, number> {
  return hasProperty(obj, prop) && isNumber(obj[prop]);
}

export function hasBooleanProperty<T extends string>(
  obj: unknown, 
  prop: T
): obj is Record<T, boolean> {
  return hasProperty(obj, prop) && isBoolean(obj[prop]);
}

// Validation Schema Interface
export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    validator?: (value: unknown) => boolean;
    errorMessage?: string;
  };
}

// Schema Validator
export function validateSchema(data: unknown, schema: ValidationSchema): void {
  if (!isObject(data)) {
    throw new ValidationError('Data must be an object', { receivedType: typeof data });
  }

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null)) {
      throw new ValidationError(`Required field '${key}' is missing`, { field: key });
    }
    
    // Skip validation for optional undefined fields
    if (value === undefined && !rules.required) {
      continue;
    }
    
    // Type validation
    switch (rules.type) {
      case 'string':
        if (!isString(value)) {
          throw new ValidationError(
            rules.errorMessage || `Field '${key}' must be a string`,
            { field: key, receivedType: typeof value, expectedType: 'string' }
          );
        }
        break;
      case 'number':
        if (!isNumber(value)) {
          throw new ValidationError(
            rules.errorMessage || `Field '${key}' must be a number`,
            { field: key, receivedType: typeof value, expectedType: 'number' }
          );
        }
        break;
      case 'boolean':
        if (!isBoolean(value)) {
          throw new ValidationError(
            rules.errorMessage || `Field '${key}' must be a boolean`,
            { field: key, receivedType: typeof value, expectedType: 'boolean' }
          );
        }
        break;
      case 'object':
        if (!isObject(value)) {
          throw new ValidationError(
            rules.errorMessage || `Field '${key}' must be an object`,
            { field: key, receivedType: typeof value, expectedType: 'object' }
          );
        }
        break;
      case 'array':
        if (!isArray(value)) {
          throw new ValidationError(
            rules.errorMessage || `Field '${key}' must be an array`,
            { field: key, receivedType: typeof value, expectedType: 'array' }
          );
        }
        break;
    }
    
    // Custom validator
    if (rules.validator && !rules.validator(value)) {
      throw new ValidationError(
        rules.errorMessage || `Field '${key}' failed custom validation`,
        { field: key, value }
      );
    }
  }
}

// Combat-specific validators
export function validateCombatAction(data: unknown): void {
  const schema: ValidationSchema = {
    type: { 
      type: 'string', 
      required: true,
      validator: (value) => ['attack', 'defend', 'flee', 'use_item', 'use_skill', 'pass'].includes(value as string),
      errorMessage: 'Action type must be one of: attack, defend, flee, use_item, use_skill, pass'
    },
    targetCharId: { type: 'string', required: false },
    itemId: { type: 'string', required: false },
    skillId: { type: 'string', required: false }
  };
  
  validateSchema(data, schema);
}

export function validateCombatStartRequest(data: unknown): void {
  const schema: ValidationSchema = {
    targetIds: { 
      type: 'array', 
      required: true,
      validator: (value) => isArray(value) && value.length > 0 && value.every(isString),
      errorMessage: 'targetIds must be a non-empty array of strings'
    },
    battleType: { 
      type: 'string', 
      required: false,
      validator: (value) => ['pve', 'pvp'].includes(value as string),
      errorMessage: 'battleType must be either pve or pvp'
    }
  };
  
  validateSchema(data, schema);
}

// Character-specific validators
export function validateCharacterCreation(data: unknown): void {
  const schema: ValidationSchema = {
    name: { 
      type: 'string', 
      required: true,
      validator: (value) => isString(value) && value.length >= 3 && value.length <= 20,
      errorMessage: 'Character name must be between 3 and 20 characters'
    },
    race: { 
      type: 'string', 
      required: true,
      validator: (value) => ['human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn'].includes(value as string),
      errorMessage: 'Race must be one of: human, elf, dwarf, orc, halfling, dragonborn'
    },
    characterClass: { 
      type: 'string', 
      required: true,
      validator: (value) => ['warrior', 'mage', 'rogue', 'cleric', 'ranger', 'paladin'].includes(value as string),
      errorMessage: 'Character class must be one of: warrior, mage, rogue, cleric, ranger, paladin'
    },
    gender: { 
      type: 'string', 
      required: true,
      validator: (value) => ['male', 'female', 'other'].includes(value as string),
      errorMessage: 'Gender must be one of: male, female, other'
    }
  };
  
  validateSchema(data, schema);
}

// Safe BigInt Conversion Utilities
export function safeBigIntToNumber(value: bigint | number | string): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (isNaN(parsed)) {
      throw new ValidationError('Invalid numeric string for BigInt conversion', { value });
    }
    value = parsed;
  }
  
  if (typeof value === 'bigint') {
    // Check if BigInt is within safe integer range
    const numberValue = Number(value);
    if (numberValue > Number.MAX_SAFE_INTEGER) {
      throw new ValidationError(
        'BigInt value exceeds safe integer range for Number conversion',
        { value: value.toString(), maxSafe: Number.MAX_SAFE_INTEGER }
      );
    }
    return numberValue;
  }
  
  throw new ValidationError('Invalid type for BigInt conversion', { type: typeof value });
}

export function safeNumberToBigInt(value: number | string | bigint): bigint {
  if (typeof value === 'bigint') {
    return value;
  }
  
  if (typeof value === 'string') {
    try {
      return BigInt(value);
    } catch (error) {
      throw new ValidationError('Invalid string for BigInt conversion', { value, error });
    }
  }
  
  if (typeof value === 'number') {
    if (!Number.isInteger(value)) {
      throw new ValidationError('Number must be an integer for BigInt conversion', { value });
    }
    
    if (value > Number.MAX_SAFE_INTEGER) {
      throw new ValidationError('Number exceeds safe integer range for BigInt conversion', { value });
    }
    
    return BigInt(Math.floor(value));
  }
  
  throw new ValidationError('Invalid type for BigInt conversion', { type: typeof value });
}

// Service Guard Utilities
export function assertServiceDefined<T>(service: T | undefined, serviceName: string): asserts service is T {
  if (service === undefined) {
    throw new ValidationError(`${serviceName} is not available`, { serviceName });
  }
}

export function withServiceGuard<T, R>(
  service: T | undefined,
  serviceName: string,
  operation: (service: T) => R
): R {
  assertServiceDefined(service, serviceName);
  return operation(service);
}