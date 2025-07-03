/**
 * Calculate experience required for a specific level
 */
export function calculateExpForLevel(level: number): bigint {
  if (level <= 1) return 0n;
  const base = 100n;
  const scaling = 115n; // 1.15 as percentage
  let exp = base;
  for (let i = 2; i < level; i++) {
    exp = (exp * scaling) / 100n;
  }
  return exp;
}

/**
 * Format large numbers with suffixes
 */
export function formatNumber(num: number | bigint): string {
  const n = typeof num === 'bigint' ? Number(num) : num;
  if (n < 1000) return n.toString();
  if (n < 1000000) return (n / 1000).toFixed(1) + 'K';
  if (n < 1000000000) return (n / 1000000).toFixed(1) + 'M';
  return (n / 1000000000).toFixed(1) + 'B';
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate character name
 */
export function isValidCharacterName(name: string): boolean {
  const namePattern = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
  return namePattern.test(name);
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}