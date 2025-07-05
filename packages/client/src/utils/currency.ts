export function formatCurrency(amount: number | string): string {
  const value = typeof amount === 'string' ? parseInt(amount, 10) : amount;
  
  if (isNaN(value)) {
    return '0';
  }
  
  // Format large numbers with K, M, B suffixes
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  // Add commas to thousands
  return value.toLocaleString();
}

export function parseCurrency(value: string): number {
  // Remove commas and parse
  const cleanValue = value.replace(/,/g, '');
  const parsed = parseInt(cleanValue, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export const CURRENCY_ICON = '🪙';
export const CURRENCY_NAME = 'Gold';
export const CURRENCY_CODE = 'GOLD';