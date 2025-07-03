import { describe, it, expect } from 'vitest';
import { greet } from './index';

describe('greet function', () => {
  it('should return a greeting message', () => {
    const result = greet('Player');
    expect(result).toBe('Hello, Player! Welcome to Aeturnis Online.');
  });

  it('should handle empty string', () => {
    const result = greet('');
    expect(result).toBe('Hello, ! Welcome to Aeturnis Online.');
  });
});