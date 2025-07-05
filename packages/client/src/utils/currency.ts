export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0';
  }
  
  // Format with thousand separators
  return numAmount.toLocaleString('en-US');
}

export function parseCurrency(value: string): number {
  // Remove any non-numeric characters except decimals
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseInt(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function abbreviateCurrency(amount: number): string {
  if (amount < 1000) {
    return amount.toString();
  } else if (amount < 1000000) {
    return `${(amount / 1000).toFixed(1)}k`;
  } else if (amount < 1000000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else {
    return `${(amount / 1000000000).toFixed(1)}B`;
  }
}