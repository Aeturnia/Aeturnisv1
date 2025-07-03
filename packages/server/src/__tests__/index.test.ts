import { describe, it, expect } from 'vitest';
import { greet } from '../index';

describe('Server Functions', () => {
  describe('greet', () => {
    it('should return a greeting with the provided name', () => {
      const result = greet('World');
      expect(result).toBe('Hello, World! Welcome to Aeturnis Online.');
    });

    it('should handle empty string', () => {
      const result = greet('');
      expect(result).toBe('Hello, ! Welcome to Aeturnis Online.');
    });

    it('should handle special characters in names', () => {
      const result = greet('Player123');
      expect(result).toBe('Hello, Player123! Welcome to Aeturnis Online.');
    });

    it('should return a string', () => {
      const result = greet('Test');
      expect(typeof result).toBe('string');
    });

    it('should include the game name', () => {
      const result = greet('Hero');
      expect(result).toContain('Aeturnis Online');
    });
  });
});