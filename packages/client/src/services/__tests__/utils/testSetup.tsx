import React from 'react';
import { vi } from 'vitest';

// Set up globals for React testing
if (typeof global !== 'undefined') {
  global.React = React;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock performance.now() if not available
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
  } as any;
}

// Add missing DOM methods that React might need
if (!global.window.requestIdleCallback) {
  global.window.requestIdleCallback = (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => {
    const start = Date.now();
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      } as IdleDeadline);
    }, options?.timeout || 1) as any;
  };
}

if (!global.window.cancelIdleCallback) {
  global.window.cancelIdleCallback = (id: number) => {
    clearTimeout(id);
  };
}

// Mock TextEncoder/TextDecoder if not available
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(input: string): Uint8Array {
      // Simple ASCII encoding
      const uint8Array = new Uint8Array(input.length);
      for (let i = 0; i < input.length; i++) {
        uint8Array[i] = input.charCodeAt(i);
      }
      return uint8Array;
    }
  } as any;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(input?: BufferSource): string {
      if (!input) return '';
      const uint8Array = new Uint8Array(input as ArrayBuffer);
      let result = '';
      for (let i = 0; i < uint8Array.length; i++) {
        result += String.fromCharCode(uint8Array[i]);
      }
      return result;
    }
  } as any;
}

export {};