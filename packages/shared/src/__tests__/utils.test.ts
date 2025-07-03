import { describe, it, expect } from 'vitest';
import { 
  calculateExpForLevel, 
  formatNumber, 
  generateId, 
  isValidCharacterName, 
  calculateDistance 
} from '../utils/index';

describe('Game Utilities', () => {
  describe('calculateExpForLevel', () => {
    it('should return 0 for level 1 or below', () => {
      expect(calculateExpForLevel(1)).toBe(0n);
      expect(calculateExpForLevel(0)).toBe(0n);
      expect(calculateExpForLevel(-1)).toBe(0n);
    });

    it('should calculate correct experience for level 2', () => {
      expect(calculateExpForLevel(2)).toBe(100n);
    });

    it('should calculate increasing experience for higher levels', () => {
      const level2Exp = calculateExpForLevel(2);
      const level3Exp = calculateExpForLevel(3);
      const level4Exp = calculateExpForLevel(4);
      
      expect(level3Exp).toBeGreaterThan(level2Exp);
      expect(level4Exp).toBeGreaterThan(level3Exp);
    });
  });

  describe('formatNumber', () => {
    it('should format small numbers without suffix', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(0)).toBe('0');
    });

    it('should format thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
    });

    it('should handle BigInt values', () => {
      expect(formatNumber(1000n)).toBe('1.0K');
      expect(formatNumber(1000000n)).toBe('1.0M');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs with proper format', () => {
      const id = generateId();
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('isValidCharacterName', () => {
    it('should accept valid character names', () => {
      expect(isValidCharacterName('Hero')).toBe(true);
      expect(isValidCharacterName('Player123')).toBe(true);
      expect(isValidCharacterName('Dark_Knight')).toBe(true);
    });

    it('should reject invalid character names', () => {
      expect(isValidCharacterName('')).toBe(false);
      expect(isValidCharacterName('a')).toBe(false);
      expect(isValidCharacterName('ab')).toBe(false);
      expect(isValidCharacterName('123abc')).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate correct distance between points', () => {
      const pos1 = { x: 0, y: 0 };
      const pos2 = { x: 3, y: 4 };
      
      expect(calculateDistance(pos1, pos2)).toBe(5);
    });

    it('should return 0 for same points', () => {
      const pos1 = { x: 5, y: 5 };
      const pos2 = { x: 5, y: 5 };
      
      expect(calculateDistance(pos1, pos2)).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const pos1 = { x: -3, y: -4 };
      const pos2 = { x: 0, y: 0 };
      
      expect(calculateDistance(pos1, pos2)).toBe(5);
    });
  });
});