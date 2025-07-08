/**
 * Common test assertions
 */
import { expect } from 'vitest';

/**
 * Assert that a value is a valid UUID
 */
export function expectUuid(value: unknown): void {
  expect(typeof value).toBe('string');
  expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
}

/**
 * Assert that a value is a valid ISO date string
 */
export function expectIsoDate(value: unknown): void {
  expect(typeof value).toBe('string');
  expect(() => new Date(value as string)).not.toThrow();
  expect(new Date(value as string).toISOString()).toBe(value);
}

/**
 * Assert that a value is a valid JWT token
 */
export function expectJwtToken(value: unknown): void {
  expect(typeof value).toBe('string');
  const parts = (value as string).split('.');
  expect(parts).toHaveLength(3);
  
  // Check that each part is base64url encoded
  parts.forEach(part => {
    expect(part).toMatch(/^[A-Za-z0-9_-]+$/);
  });
}

/**
 * Assert that an object has timestamp fields
 */
export function expectTimestamps(obj: any): void {
  expect(obj).toHaveProperty('createdAt');
  expect(obj).toHaveProperty('updatedAt');
  expectIsoDate(obj.createdAt);
  expectIsoDate(obj.updatedAt);
}

/**
 * Assert that an object matches a shape (partial deep equality)
 */
export function expectShape<T>(actual: unknown, expected: Partial<T>): void {
  expect(actual).toMatchObject(expected);
}

/**
 * Assert that an array contains items matching a shape
 */
export function expectArrayOfShape<T>(
  array: unknown[],
  shape: Partial<T>,
  options?: { minLength?: number; maxLength?: number; exactLength?: number }
): void {
  expect(Array.isArray(array)).toBe(true);
  
  if (options?.exactLength !== undefined) {
    expect(array).toHaveLength(options.exactLength);
  }
  if (options?.minLength !== undefined) {
    expect(array.length).toBeGreaterThanOrEqual(options.minLength);
  }
  if (options?.maxLength !== undefined) {
    expect(array.length).toBeLessThanOrEqual(options.maxLength);
  }
  
  array.forEach(item => {
    expectShape(item, shape);
  });
}

/**
 * Assert that a number is within a range
 */
export function expectInRange(
  value: number,
  min: number,
  max: number,
  inclusive: boolean = true
): void {
  if (inclusive) {
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  } else {
    expect(value).toBeGreaterThan(min);
    expect(value).toBeLessThan(max);
  }
}

/**
 * Assert that a value is one of the expected values
 */
export function expectOneOf<T>(value: T, expected: T[]): void {
  expect(expected).toContain(value);
}

/**
 * Assert that an async function throws with a specific error message
 */
export async function expectAsyncThrows(
  fn: () => Promise<any>,
  errorMessage?: string | RegExp
): Promise<void> {
  let error: Error | undefined;
  
  try {
    await fn();
  } catch (e) {
    error = e as Error;
  }
  
  expect(error).toBeDefined();
  
  if (errorMessage) {
    if (typeof errorMessage === 'string') {
      expect(error!.message).toContain(errorMessage);
    } else {
      expect(error!.message).toMatch(errorMessage);
    }
  }
}

/**
 * Assert that a function was called with specific arguments
 */
export function expectCalledWith(
  mockFn: any,
  expectedArgs: any[],
  options?: { times?: number; partial?: boolean }
): void {
  if (options?.times !== undefined) {
    expect(mockFn).toHaveBeenCalledTimes(options.times);
  } else {
    expect(mockFn).toHaveBeenCalled();
  }
  
  if (options?.partial) {
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs, expect.anything());
  } else {
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
  }
}

/**
 * Assert that an event was emitted
 */
export function expectEventEmitted(
  emitter: any,
  eventName: string,
  data?: any
): void {
  expect(emitter.emit).toHaveBeenCalled();
  
  const calls = emitter.emit.mock.calls;
  const eventCall = calls.find((call: any[]) => call[0] === eventName);
  
  expect(eventCall).toBeDefined();
  
  if (data !== undefined) {
    expect(eventCall[1]).toEqual(data);
  }
}

/**
 * Assert socket.io emission
 */
export function expectSocketEmit(
  socket: any,
  event: string,
  data?: any,
  options?: { to?: string; broadcast?: boolean }
): void {
  if (options?.to) {
    expect(socket.to).toHaveBeenCalledWith(options.to);
  }
  
  const emitTarget = options?.broadcast ? socket.broadcast : socket;
  expect(emitTarget.emit).toHaveBeenCalledWith(event, data);
}

/**
 * Assert that a promise resolves within a timeout
 */
export async function expectResolvesWithin(
  promise: Promise<any>,
  timeout: number
): Promise<void> {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`Promise did not resolve within ${timeout}ms`)), timeout)
  );
  
  await Promise.race([promise, timeoutPromise]);
}